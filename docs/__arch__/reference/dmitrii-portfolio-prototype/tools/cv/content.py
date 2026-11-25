"""CV content in three languages. Facts only — keep in sync with the site (index.html)."""

CONTACTS = {
    "email": "dmitriiprikhodko9@gmail.com",
    "linkedin": "linkedin.com/in/dimbo1324",
    "github": "github.com/dimbo1324",
}

CV = {
"en": {
  "name": "Dmitrii Prikhodko",
  "title": "Industrial Automation, IIoT & Software Engineer",
  "location": "Montevideo, Uruguay · UTC−3",
  "availability": "Open to on-site, hybrid and remote roles",
  "sections": {"profile": "Profile", "results": "Selected results", "experience": "Experience",
               "skills": "Skills", "education": "Education", "languages": "Languages"},
  "profile": "Engineer with 5+ years across oil & gas, nuclear and thermal power. I commission PLC / DCS / SIS systems on "
             "live plants and build the software around them: digital twins, telemetry pipelines and C++ / Python backends.",
  "results": [("2,500+", "field I/O signals verified at a live refinery"), ("−25%", "PLC project delivery time (4 → 3 weeks)"),
              ("+12%", "yield of an automated electroplating line")],
  "jobs": [
    ("2025 – 2026", "Infrastruktura TK", "IIoT & Industrial Systems Engineer · Moscow", [
      "Full-cycle SAT/FAT at the LUKOIL Kstovo refinery (units L-24/7 and AVT-5) with live SIS/ESD validation; 2,500+ field I/O signals verified.",
      "Built an ODE-based thermal power plant digital twin: 4 cascaded virtual PID loops, Python/gRPC, InfluxDB/PostgreSQL, MQTT."]),
    ("2025", "Intelligent Security Systems", "C++ Backend Developer · Remote contract", [
      "Unit and integration test automation for C++ microservices (SecurOS), Jenkins CI, WebSocket, Linux debugging."]),
    ("2023 – 2025", "Transneft A&M", "IIoT Engineer & Software Developer · Moscow", [
      "Created a reusable IEC 61131-3 library that cut delivery from 4 to 3 weeks, plus a no-code FBD DSL; enhanced SCADA web apps (React / Next.js).",
      "Led SAT/FAT at 3 oil pumping stations with Siemens, Schneider, B&R and Prosoft equipment."]),
    ("2022 – 2023", "OKBM Afrikantov", "R&D Engineer · Nuclear fluid dynamics", [
      "CFD vibration simulations (ANSYS CFX, Logos) of VVER reactor steam generators, validated via PIV/LDV.",
      "Sensor acquisition in C++ (OpenCV, VTK) and NI-DAQmx, automated with Python and MATLAB."]),
    ("2021 – 2022", "NIITOP", "Automation & IoT Engineer · Instrumentation", [
      "Automated an electroplating line: the operator left the toxic zone, yield +12%.",
      "Engineered an ATmega48 cooling controller for a 5 kW microwave load; improved C++ libraries (CuraEngine, Marlin)."]),
  ],
  "skills": [
    ("Control systems", "PLC / DCS / SIS, SCADA, IEC 61131-3 (ST / FBD), SAT / FAT commissioning"),
    ("Hardware", "Siemens, Schneider Electric, B&R, Prosoft, Elara (SURA)"),
    ("Protocols", "MQTT, OPC UA, Modbus, IEC 61850"),
    ("Data & twins", "Digital twins, ODE models, InfluxDB, Grafana"),
    ("Software", "C++, Python, Go · gRPC, WebSocket · PostgreSQL, MongoDB · React / Next.js"),
    ("DevOps", "Docker, Linux, Jenkins CI · AI-assisted: Claude Code, OpenAI Codex"),
  ],
  "education": [
    ("2021 – 2023", "MSc Thermal Power Engineering (honours)", "NNSTU n.a. R. E. Alekseev, Nizhny Novgorod"),
    ("2017 – 2021", "BSc Thermal Power Engineering", "Nuclear and thermal plant design, heat and mass transfer"),
    ("2025", "C++ Developer retraining diploma", "Skillfactory, Moscow · 340 academic hours"),
  ],
  "languages": [("Russian", "native"), ("English", "B1 / B2"), ("Spanish", "learning")],
},
"es": {
  "name": "Dmitrii Prikhodko",
  "title": "Ingeniero en automatización industrial, IIoT y software",
  "location": "Montevideo, Uruguay · UTC−3",
  "availability": "Disponible para trabajo presencial, híbrido y remoto",
  "sections": {"profile": "Perfil", "results": "Resultados destacados", "experience": "Experiencia",
               "skills": "Habilidades", "education": "Formación", "languages": "Idiomas"},
  "profile": "Ingeniero con más de 5 años en petróleo y gas, energía nuclear y térmica. Pongo en marcha sistemas PLC / DCS / SIS "
             "en plantas en operación y desarrollo su software: gemelos digitales, telemetría y backends en C++ / Python.",
  "results": [("2.500+", "señales de E/S verificadas en una refinería"),
              ("−25 %", "plazo de entrega PLC (4 → 3 semanas)"),
              ("+12 %", "rendimiento de la línea de galvanizado")],
  "jobs": [
    ("2025 – 2026", "Infrastruktura TK", "Ingeniero IIoT y de sistemas industriales · Moscú", [
      "SAT/FAT de ciclo completo en la refinería LUKOIL de Kstovo (unidades L-24/7 y AVT-5) con validación SIS/ESD en vivo; más de 2.500 señales de E/S verificadas.",
      "Desarrollé un gemelo digital de una central térmica basado en EDO: 4 lazos PID virtuales en cascada, Python/gRPC, InfluxDB/PostgreSQL, MQTT."]),
    ("2025", "Intelligent Security Systems", "Desarrollador backend C++ · Contrato remoto", [
      "Automatización de pruebas unitarias y de integración de microservicios C++ (SecurOS), Jenkins CI, WebSocket, depuración en Linux."]),
    ("2023 – 2025", "Transneft A&M", "Ingeniero IIoT y desarrollador de software · Moscú", [
      "Creé una biblioteca IEC 61131-3 reutilizable que redujo la entrega de 4 a 3 semanas y un DSL FBD sin código; mejoré aplicaciones web SCADA (React / Next.js).",
      "Lideré SAT/FAT en 3 estaciones de bombeo de petróleo con equipos Siemens, Schneider, B&R y Prosoft."]),
    ("2022 – 2023", "OKBM Afrikantov", "Ingeniero de I+D · Dinámica de fluidos nuclear", [
      "Simulaciones CFD de vibraciones (ANSYS CFX, Logos) de generadores de vapor de reactores VVER, validadas con PIV/LDV.",
      "Adquisición de sensores en C++ (OpenCV, VTK) y NI-DAQmx con Python y MATLAB."]),
    ("2021 – 2022", "NIITOP", "Ingeniero de automatización e IoT · Instrumentación", [
      "Automaticé una línea de galvanizado: el operador salió de la zona tóxica y el rendimiento subió un 12 %.",
      "Controlador de refrigeración ATmega48 para una carga de microondas de 5 kW; mejoras en C++ (CuraEngine, Marlin)."]),
  ],
  "skills": [
    ("Control", "PLC / DCS / SIS, SCADA, IEC 61131-3 (ST / FBD), puesta en marcha SAT / FAT"),
    ("Hardware", "Siemens, Schneider Electric, B&R, Prosoft, Elara (SURA)"),
    ("Protocolos", "MQTT, OPC UA, Modbus, IEC 61850"),
    ("Datos", "Gemelos digitales, modelos EDO, InfluxDB, Grafana"),
    ("Software", "C++, Python, Go · gRPC, WebSocket · PostgreSQL, MongoDB · React / Next.js"),
    ("DevOps", "Docker, Linux, Jenkins CI · con IA: Claude Code, OpenAI Codex"),
  ],
  "education": [
    ("2021 – 2023", "Máster en Ingeniería Termoenergética (con honores)", "NNSTU R. E. Alekseev, Nizhni Nóvgorod"),
    ("2017 – 2021", "Grado en Ingeniería Termoenergética", "Centrales nucleares y térmicas, transferencia de calor"),
    ("2025", "Diploma de reconversión: desarrollador C++", "Skillfactory, Moscú · 340 horas académicas"),
  ],
  "languages": [("Ruso", "nativo"), ("Inglés", "B1 / B2"), ("Español", "aprendiendo")],
},
"ru": {
  "name": "Дмитрий Приходько",
  "title": "Инженер АСУ ТП, IIoT и разработчик ПО",
  "location": "Монтевидео, Уругвай · UTC−3",
  "availability": "Открыт к работе в офисе, гибридно и удалённо",
  "sections": {"profile": "О себе", "results": "Ключевые результаты", "experience": "Опыт работы",
               "skills": "Навыки", "education": "Образование", "languages": "Языки"},
  "profile": "Инженер с опытом более 5 лет в нефтегазе, атомной и тепловой энергетике. Ввожу в работу системы ПЛК / РСУ / ПАЗ "
             "на действующих объектах и пишу для них ПО: цифровые двойники, телеметрию, бэкенд на C++ / Python.",
  "results": [("2 500+", "полевых сигналов проверено на НПЗ"),
              ("−25%", "срок поставки ПЛК (4 → 3 недели)"),
              ("+12%", "выход гальванической линии")],
  "jobs": [
    ("2025 – 2026", "Инфраструктура ТК", "Инженер IIoT и промышленных систем · Москва", [
      "Полный цикл SAT/FAT на НПЗ ЛУКОЙЛ в Кстово (Л-24/7, АВТ-5) с проверкой ПАЗ/ESD вживую; более 2 500 сигналов.",
      "Разработал цифровой двойник ТЭС на ОДУ: 4 каскадных виртуальных ПИД-контура, Python/gRPC, InfluxDB/PostgreSQL, MQTT."]),
    ("2025", "Intelligent Security Systems", "Бэкенд-разработчик C++ · удалённый контракт", [
      "Автотесты микросервисов на C++ (SecurOS), Jenkins CI, WebSocket, отладка под Linux."]),
    ("2023 – 2025", "Транснефть А&М", "Инженер IIoT и разработчик ПО · Москва", [
      "Библиотека IEC 61131-3 (поставка 4 → 3 недели) и no-code DSL на FBD; веб-приложения SCADA (React / Next.js).",
      "Руководил SAT/FAT на 3 нефтеперекачивающих станциях с оборудованием Siemens, Schneider, B&R и Prosoft."]),
    ("2022 – 2023", "ОКБМ Африкантов", "Инженер-исследователь · гидродинамика ЯЭУ", [
      "CFD-моделирование вибраций (ANSYS CFX, Логос) парогенераторов реакторов ВВЭР с валидацией PIV/LDV.",
      "Сбор данных с датчиков на C++ (OpenCV, VTK) и NI-DAQmx с Python и MATLAB."]),
    ("2021 – 2022", "НИИТОП", "Инженер по автоматизации и IoT · приборостроение", [
      "Автоматизировал гальваническую линию: оператор выведен из токсичной зоны, выход продукции +12%.",
      "Контроллер охлаждения на ATmega48 для СВЧ-нагрузки 5 кВт; доработка C++ (CuraEngine, Marlin)."]),
  ],
  "skills": [
    ("Управление", "ПЛК / РСУ / ПАЗ, SCADA, IEC 61131-3 (ST / FBD), пусконаладка SAT / FAT"),
    ("Оборудование", "Siemens, Schneider Electric, B&R, Prosoft, Elara (SURA)"),
    ("Протоколы", "MQTT, OPC UA, Modbus, IEC 61850"),
    ("Данные", "Цифровые двойники, модели на ОДУ, InfluxDB, Grafana"),
    ("Разработка", "C++, Python, Go · gRPC, WebSocket · PostgreSQL, MongoDB · React / Next.js"),
    ("DevOps", "Docker, Linux, Jenkins CI · с ИИ: Claude Code, OpenAI Codex"),
  ],
  "education": [
    ("2021 – 2023", "Магистратура: теплоэнергетика и теплотехника (с отличием)", "НГТУ им. Р. Е. Алексеева, Нижний Новгород"),
    ("2017 – 2021", "Бакалавриат: теплоэнергетика и теплотехника", "Проектирование АЭС и ТЭС, тепломассообмен"),
    ("2025", "Диплом о переподготовке: разработчик C++", "Skillfactory, Москва · 340 академических часов"),
  ],
  "languages": [("Русский", "родной"), ("Английский", "B1 / B2"), ("Испанский", "изучаю")],
},
}
