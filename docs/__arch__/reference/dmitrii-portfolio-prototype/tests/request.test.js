import { test } from "node:test";
import assert from "node:assert/strict";
import { RequestPayload } from "../js/features/request/RequestPayload.js";
import { createGateway } from "../js/features/request/gateways/createGateway.js";
import { MailtoGateway } from "../js/features/request/gateways/MailtoGateway.js";
import { HttpGateway } from "../js/features/request/gateways/HttpGateway.js";

const NOW = new Date("2026-11-20T12:00:00Z");
const values = {
  lastName: "  Prikhodko ",
  firstName: "Dmitrii",
  middleName: "",
  phone: " +598  96 671 725 ",
  email: "Name@Company.COM",
  message: "  Hello\nthere  ",
};

test("RequestPayload normalises whitespace and email case", () => {
  const payload = new RequestPayload(values, { lang: "es", now: NOW });
  assert.equal(payload.lastName, "Prikhodko");
  assert.equal(payload.phone, "+598 96 671 725");
  assert.equal(payload.email, "name@company.com");
  assert.equal(payload.message, "Hello\nthere");
  assert.equal(payload.fullName, "Prikhodko Dmitrii");
  assert.ok(Object.isFrozen(payload));
});

test("RequestPayload renders plain text and JSON", () => {
  const payload = new RequestPayload(values, { lang: "es", now: NOW });
  const text = payload.toPlainText();
  assert.match(text, /^Name: Prikhodko Dmitrii$/m);
  assert.match(text, /^Language: ES$/m);
  assert.match(text, /2026-11-20T12:00:00.000Z/);
  assert.deepEqual(payload.toJSON(), {
    lastName: "Prikhodko",
    firstName: "Dmitrii",
    middleName: null,
    phone: "+598 96 671 725",
    email: "name@company.com",
    message: "Hello\nthere",
    lang: "es",
    createdAt: "2026-11-20T12:00:00.000Z",
  });
  assert.equal(payload.subject("Website request"), "Website request — Prikhodko Dmitrii");
});

const config = (http) => ({ transport: "auto", recipient: "me@example.com", subjectPrefix: "Req", http });

test("auto transport: mailto without a back-end, http with one", () => {
  assert.ok(createGateway(config({ provider: "web3forms", endpoint: null, accessKey: null })) instanceof MailtoGateway);
  assert.ok(createGateway(config({ provider: "web3forms", endpoint: null, accessKey: "k" })) instanceof HttpGateway);
  assert.ok(
    createGateway(config({ provider: "formspree", endpoint: "https://formspree.io/f/x", accessKey: null })) instanceof
      HttpGateway,
  );
  assert.ok(createGateway(config({ provider: "formspree", endpoint: null, accessKey: "k" })) instanceof MailtoGateway);
});

test("MailtoGateway builds an encoded mailto: URL and reports the recipient", async () => {
  let opened = "";
  const gateway = new MailtoGateway({ recipient: "me@example.com", subjectPrefix: "Req", navigate: (url) => (opened = url) });
  const result = await gateway.send(new RequestPayload(values, { now: NOW }));
  assert.match(opened, /^mailto:me@example\.com\?subject=Req%20%E2%80%94%20Prikhodko%20Dmitrii&body=/);
  assert.deepEqual(result, { ok: true, messageKey: "form.result.mailto", vars: { recipient: "me@example.com" } });
});

test("HttpGateway posts the Web3Forms body and maps the response", async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return { ok: calls.length === 1, status: calls.length === 1 ? 200 : 500 };
  };
  const gateway = new HttpGateway({ provider: "web3forms", accessKey: "public-key", subjectPrefix: "Req", fetchImpl });
  const payload = new RequestPayload(values, { now: NOW });

  assert.deepEqual(await gateway.send(payload), { ok: true, messageKey: "form.result.delivered" });
  assert.equal(calls[0].url, "https://api.web3forms.com/submit");
  assert.equal(calls[0].body.access_key, "public-key");
  assert.equal(calls[0].body.replyto, "name@company.com");

  assert.deepEqual(await gateway.send(payload), { ok: false, messageKey: "form.result.failed" });
});

test("HttpGateway refuses to start without an endpoint", () => {
  assert.throws(() => new HttpGateway({ provider: "custom", subjectPrefix: "Req" }), /endpoint/);
});
