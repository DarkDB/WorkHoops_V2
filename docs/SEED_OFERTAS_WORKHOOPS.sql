-- ============================================================
-- WorkHoops — Ofertas semilla para captar jugadores
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- PASO 1: Crear organización WorkHoops Scouting
INSERT INTO organizations (id, name, slug, description, website, logo, verified, "ownerId", "createdAt", "updatedAt")
VALUES (
  'org_workhoops_scouting',
  'WorkHoops Scouting',
  'workhoops-scouting',
  'Servicio de scouting y captación de talento para clubes de baloncesto de toda España.',
  'https://workhoops.com',
  NULL,
  true,
  'cmh63xs6i0000z3nbrrgdsrtx',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PASO 2: Insertar ofertas (30 ofertas variadas por España)
-- ============================================================

INSERT INTO "opportunities" (
  id, title, slug, description, type, status, level,
  city, country, modality,
  "contactEmail", "publishedAt", deadline,
  "authorId", "organizationId",
  verified, "createdAt", "updatedAt"
) VALUES

-- MADRID
('opp_mad_001', 
'Club de la Primera FEB busca Base para temporada 2026/27',
'primera-feb-madrid-base-2026',
'Club de baloncesto masculino de la Primera FEB con sede en Madrid busca incorporar un Base para completar su plantilla de cara a la temporada 2026/27.

¿Qué buscamos?
- Base con experiencia en categorías nacionales
- Buen manejo del juego exterior y visión de juego
- Capacidad de liderazgo en pista
- Disponibilidad total para entrenamientos y partidos

¿Qué ofrecemos?
- Proyecto deportivo serio y ambicioso
- Cuerpo técnico de alto nivel
- Instalaciones de calidad
- Condiciones económicas según perfil

Si estás interesado/a, envíanos tu currículum deportivo completo con estadísticas de la última temporada, vídeos de juego y datos de contacto.',
'empleo', 'publicada', 'semi_profesional',
'Madrid', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-31 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

('opp_mad_002',
'Buscamos Ala-Pívot para equipo femenino — Segunda FEB Madrid',
'segunda-feb-madrid-ala-pivot-femenino-2026',
'Club femenino de la Segunda FEB en la Comunidad de Madrid busca Ala-Pívot para la temporada 2026/27.

Perfil buscado:
- Ala-Pívot con experiencia en categorías autonómicas o nacionales
- Buena lectura del juego interior/exterior
- Actitud competitiva y trabajo en equipo
- Disponibilidad para entrenar en Madrid

Ofrecemos proyecto estable, buen ambiente y posibilidad de crecimiento.

Envía tu CV deportivo con estadísticas y referencias a nuestro email.',
'empleo', 'publicada', 'semi_profesional',
'Madrid', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-31 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

('opp_mad_003',
'Captación jugadores Tercera FEB Madrid — Todas las posiciones',
'tercera-feb-madrid-todas-posiciones-2026',
'Club de la Tercera FEB masculino en Madrid está realizando proceso de captación para completar su plantilla 2026/27.

Buscamos jugadores para todas las posiciones:
- Bases y Escoltas
- Aleros
- Ala-Pívots y Pívots

Nivel requerido: experiencia en categorías autonómicas o Tercera FEB.

Compromiso, actitud y ganas de competir son imprescindibles.

Manda tu CV deportivo con historial, estadísticas y si tienes vídeos de juego, mejor.',
'empleo', 'publicada', 'amateur',
'Madrid', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- BARCELONA
('opp_bcn_001',
'Escolta buscado para club de Primera FEB — Barcelona',
'primera-feb-barcelona-escolta-2026',
'Club de baloncesto de Primera FEB en Barcelona incorpora Escolta para la temporada 2026/27.

Buscamos:
- Escolta con experiencia mínima en Segunda FEB o similar
- Buen porcentaje de tiro exterior
- Rapidez y capacidad defensiva
- Disponibilidad para residir en Barcelona o alrededores

Proyecto serio con presupuesto acorde a la categoría.

Envía currículum deportivo completo, estadísticas de las últimas dos temporadas y material audiovisual si dispones.',
'empleo', 'publicada', 'semi_profesional',
'Barcelona', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

('opp_bcn_002',
'Club femenino LF Challenge Barcelona — Pívot',
'lf-challenge-barcelona-pivot-femenino-2026',
'Equipo femenino de LF Challenge en el área metropolitana de Barcelona busca Pívot para 2026/27.

Perfil:
- Pívot con experiencia en Primera Autonómica o superior
- Buena presencia física y dominio del poste bajo
- Trabajo defensivo y en el rebote
- Posibilidad de ayuda con alojamiento para candidatas de fuera

Proyecto en crecimiento con buenas instalaciones.

CV deportivo con historial completo y referencias de entrenadores anteriores.',
'empleo', 'publicada', 'semi_profesional',
'Barcelona', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-31 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- VALENCIA
('opp_vlc_001',
'Base o Escolta para equipo Primera Autonómica masculino — Valencia',
'primera-autonomica-valencia-base-escolta-2026',
'Club valenciano de Primera Autonómica masculina busca Base o Escolta para completar plantilla 2026/27.

Buscamos jugador con:
- Experiencia en Primera Autonómica o Tercera FEB
- Buen físico y mentalidad competitiva
- Disponibilidad para entrenar en Valencia ciudad
- Compromisos laborales/estudios compatibles con el calendario

Ofrecemos: proyecto familiar con ambición de ascenso, buenas instalaciones y buen ambiente de equipo.

Mándanos tu CV deportivo y estadísticas.',
'empleo', 'publicada', 'amateur',
'Valencia', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

('opp_vlc_002',
'Prueba abierta — Club Tercera FEB femenino Valencia',
'tercera-feb-femenino-valencia-prueba-2026',
'Club femenino de Tercera FEB en Valencia organiza jornada de pruebas para todas las posiciones.

Todas las posiciones abiertas:
- Bases, escoltas, aleras, ala-pívots y pívots

Requisitos:
- Nacidas a partir de 2000 (valoramos también veteranas)
- Experiencia en categorías autonómicas

Envíanos tu ficha con datos personales, posición, altura y experiencia para confirmar asistencia.',
'prueba', 'publicada', 'amateur',
'Valencia', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-07-31 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- SEVILLA
('opp_sev_001',
'Alero para Segunda FEB masculino — Sevilla',
'segunda-feb-sevilla-alero-2026',
'Club sevillano de Segunda FEB busca Alero para incorporación inmediata de cara a 2026/27.

Perfil buscado:
- Alero polivalente, bueno en penetración y tiro
- Altura entre 1.93 y 2.00m
- Experiencia mínima en Tercera FEB o Primera Autonómica de nivel
- Disponibilidad para residir en Sevilla

Buenas condiciones para el perfil adecuado.

Envía CV deportivo completo con vídeos si dispones.',
'empleo', 'publicada', 'semi_profesional',
'Sevilla', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- ZARAGOZA
('opp_zar_001',
'Pívot masculino — Tercera FEB Zaragoza',
'tercera-feb-zaragoza-pivot-2026',
'Club aragonés de Tercera FEB busca Pívot para la temporada 2026/27.

Buscamos:
- Pívot con altura mínima 2.00m
- Buena movilidad y presencia física
- Reboteador y eficaz en el poste bajo
- Nivel autonómico o Tercera FEB

Proyecto estable en ciudad con buena calidad de vida.

CV deportivo con estadísticas y datos de contacto.',
'empleo', 'publicada', 'amateur',
'Zaragoza', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-01 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- MÁLAGA
('opp_mlg_001',
'Club LF Challenge Málaga — Base femenina',
'lf-challenge-malaga-base-femenina-2026',
'Club femenino de LF Challenge en Málaga busca Base para reforzar su proyecto 2026/27.

Perfil:
- Base con visión de juego y liderazgo
- Experiencia en Primera Nacional o superior
- Buena conducción y manejo del pick and roll
- Posibilidad de apoyo económico y alojamiento

Envía historial deportivo completo.',
'empleo', 'publicada', 'semi_profesional',
'Málaga', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-20 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- BILBAO
('opp_bil_001',
'Todas las posiciones — Primera FEB masculino País Vasco',
'primera-feb-pais-vasco-bilbao-2026',
'Club de Primera FEB en el País Vasco realiza proceso de selección de jugadores para 2026/27.

Posiciones prioritarias:
- Base veterano con experiencia en categorías nacionales
- Alero largo (1.98-2.05m)
- Ala-Pívot con movilidad exterior

Proyecto ambicioso con respaldo económico. Condiciones competitivas.

Envía CV deportivo detallado con estadísticas de las últimas dos temporadas, referencias y material de vídeo.',
'empleo', 'publicada', 'semi_profesional',
'Bilbao', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-10 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- MURCIA
('opp_mur_001',
'Escolta o Alero — Segunda FEB masculino Murcia',
'segunda-feb-murcia-escolta-alero-2026',
'Equipo murciano de Segunda FEB busca Escolta o Alero para cerrar plantilla 2026/27.

Buscamos:
- Jugador entre 1.90 y 1.97m
- Polivalencia en las posiciones 2/3
- Buen tiro exterior y mentalidad defensiva
- Con o sin residencia en Murcia (valoramos disponibilidad)

Condiciones según nivel del candidato.

CV deportivo completo con estadísticas.',
'empleo', 'publicada', 'semi_profesional',
'Murcia', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-25 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- GRANADA
('opp_gra_001',
'Prueba abierta club Tercera FEB masculino — Granada',
'tercera-feb-granada-prueba-masculino-2026',
'Club granadino de Tercera FEB organiza jornadas de prueba abiertas para todas las posiciones.

Perfil general buscado:
- Jugadores con experiencia en categorías autonómicas
- Actitud de trabajo y compromiso
- Disponibilidad para entrenar en Granada

Manda tu ficha (datos personales, posición, altura, historial) para confirmar asistencia a las pruebas.',
'prueba', 'publicada', 'amateur',
'Granada', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-07-20 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- ALICANTE
('opp_ali_001',
'Pívot o Ala-Pívot femenina — Primera Autonómica Alicante',
'primera-autonomica-alicante-pivot-femenino-2026',
'Club femenino de Primera Autonómica en Alicante busca Pívot o Ala-Pívot para 2026/27.

Perfil:
- Interior con experiencia autonómica
- Físico y presencia en la pintura
- Comprometida con el proyecto
- Disponibilidad en la provincia de Alicante

Proyecto familiar con muy buen ambiente. Condiciones según perfil.

Envíanos tu CV deportivo.',
'empleo', 'publicada', 'amateur',
'Alicante', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-10 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- VALLADOLID
('opp_val_001',
'Club Primera FEB Castilla y León — Ala-Pívot masculino',
'primera-feb-valladolid-ala-pivot-2026',
'Club castellano de Primera FEB busca Ala-Pívot para reforzar su plantilla de cara a 2026/27.

Perfil buscado:
- Ala-Pívot entre 2.00 y 2.07m
- Experiencia en Primera o Segunda FEB
- Movilidad exterior y buen uno contra uno
- Disponibilidad para residir en Castilla y León

Condiciones competitivas para el perfil adecuado. Proyecto con continuidad.

CV completo con estadísticas, referencias y vídeos.',
'empleo', 'publicada', 'semi_profesional',
'Valladolid', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-05 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- PAMPLONA
('opp_pam_001',
'Base masculino — Tercera FEB Navarra',
'tercera-feb-navarra-base-2026',
'Club navarro de Tercera FEB busca Base para temporada 2026/27.

Buscamos:
- Base con mentalidad de líder
- Experiencia en Primera Autonómica o Tercera FEB
- Buen manejo del pick and roll
- Disponibilidad para entrenar en Pamplona

Proyecto estable con ambición deportiva.

CV deportivo y estadísticas a nuestro correo.',
'empleo', 'publicada', 'amateur',
'Pamplona', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-01 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- VITORIA
('opp_vit_001',
'Todas las posiciones — Club femenino Segunda FEB Vitoria',
'segunda-feb-vitoria-femenino-2026',
'Club femenino de Segunda FEB en Vitoria-Gasteiz realiza proceso de captación para 2026/27.

Posiciones abiertas:
- Base y Escolta
- Alera con capacidad anotadora
- Interior (Pívot o Ala-Pívot)

Requisitos: experiencia mínima en Primera Autonómica o superior.

Proyecto consolidado con gran ambiente de trabajo.

Envía tu historial deportivo completo.',
'empleo', 'publicada', 'semi_profesional',
'Vitoria', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-20 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- A CORUÑA
('opp_coru_001',
'Escolta masculino — Primera Autonómica Galicia',
'primera-autonomica-galicia-escolta-2026',
'Club gallego de Primera Autonómica busca Escolta para 2026/27.

Perfil:
- Escolta con experiencia autonómica
- Buen tiro y capacidad de penetración
- Actitud de trabajo y compromiso con el equipo
- Disponibilidad en A Coruña o alrededores

Proyecto serio con posibilidades de crecimiento.

CV deportivo con estadísticas.',
'empleo', 'publicada', 'amateur',
'A Coruña', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- SANTANDER
('opp_san_001',
'Prueba abierta femenino — Primera Autonómica Cantabria',
'primera-autonomica-cantabria-femenino-prueba-2026',
'Club cántabro de Primera Autonómica femenina organiza jornada de captación para la temporada 2026/27.

Buscamos jugadoras para todas las posiciones.

Requisitos mínimos:
- Experiencia en categorías autonómicas
- Ganas de competir y trabajar

Mándanos tu ficha con datos personales, posición y experiencia previa.',
'prueba', 'publicada', 'amateur',
'Santander', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-07-25 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- PALMA
('opp_pal_001',
'Alero masculino — Tercera FEB Baleares',
'tercera-feb-baleares-alero-2026',
'Club balear de Tercera FEB busca Alero para completar su plantilla 2026/27.

Buscamos:
- Alero entre 1.93 y 2.00m
- Polivalencia y mentalidad ganadora
- Experiencia en categorías autonómicas o nacionales
- Valoramos jugadores con disponibilidad para residir en Mallorca

Proyecto con historia y buenos aficionados.

CV deportivo y disponibilidad.',
'empleo', 'publicada', 'amateur',
'Palma', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-01 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- LAS PALMAS
('opp_lpgc_001',
'Base femenina — Primera Autonómica Canarias',
'primera-autonomica-canarias-base-femenino-2026',
'Club canario de Primera Autonómica femenina busca Base para 2026/27.

Perfil:
- Base con liderazgo y visión de juego
- Experiencia en categorías autonómicas o nacionales
- Comprometida con el proyecto a largo plazo
- Disponibilidad en Las Palmas de Gran Canaria

Excelente ambiente de equipo y proyecto con ambición.

Envía tu CV deportivo completo.',
'empleo', 'publicada', 'amateur',
'Las Palmas', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-10 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- SALAMANCA
('opp_sal_001',
'Pívot masculino — Segunda FEB Salamanca',
'segunda-feb-salamanca-pivot-2026',
'Club salmantino de Segunda FEB incorpora Pívot para la temporada 2026/27.

Perfil buscado:
- Pívot con altura mínima 2.02m
- Experiencia en Tercera FEB o superior
- Buen rendimiento defensivo y en el rebote
- Posibilidad de apoyo con alojamiento

Proyecto con presupuesto acorde a Segunda FEB.

CV con estadísticas y referencias.',
'empleo', 'publicada', 'semi_profesional',
'Salamanca', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-10 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- BURGOS
('opp_bur_001',
'Club Primera FEB Burgos — Escolta o Alero',
'primera-feb-burgos-escolta-alero-2026',
'Club burgalés de Primera FEB busca Escolta o Alero para la próxima temporada.

Perfil deseado:
- Jugador entre 1.92 y 1.99m
- Experiencia en Primera o Segunda FEB
- Buen tiro y capacidad anotadora
- Disponibilidad para residir en Burgos

Condiciones económicas competitivas. Proyecto serio.

Currículum deportivo completo, estadísticas de últimas dos temporadas y vídeos si dispone.',
'empleo', 'publicada', 'semi_profesional',
'Burgos', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-01 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- LOGROÑO
('opp_log_001',
'Todas las posiciones — Tercera FEB La Rioja masculino',
'tercera-feb-la-rioja-masculino-2026',
'Club riojano de Tercera FEB abre proceso de captación para todas las posiciones de cara a 2026/27.

Buscamos jugadores:
- Con experiencia en Primera Autonómica o Tercera FEB
- Disponibles para entrenar en Logroño
- Con actitud de equipo y compromiso

Buen ambiente, instalaciones modernas y proyecto con continuidad.

Manda tu CV deportivo con experiencia y estadísticas.',
'empleo', 'publicada', 'amateur',
'Logroño', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- CÓRDOBA
('opp_cor_001',
'Ala-Pívot femenina — Primera Nacional Andalucía',
'primera-nacional-cordoba-ala-pivot-femenino-2026',
'Club cordobés de Primera Nacional femenina busca Ala-Pívot para 2026/27.

Perfil:
- Interior entre 1.75 y 1.85m
- Experiencia en autonómica o nacional
- Trabajo en equipo y rebote
- Disponibilidad en Córdoba

Proyecto familiar con excelente ambiente.

CV deportivo y fotos/vídeos.',
'empleo', 'publicada', 'amateur',
'Córdoba', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-10 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- BADAJOZ
('opp_bdj_001',
'Prueba jugadores — Club Primera Autonómica Extremadura',
'primera-autonomica-extremadura-badajoz-2026',
'Club extremeño de Primera Autonómica masculina organiza pruebas de captación para la temporada 2026/27.

Todas las posiciones abiertas.

Buscamos jugadores con:
- Ganas de competir y trabajar
- Disponibilidad en la provincia de Badajoz
- Actitud positiva y compromiso

Mándanos tu ficha para organizar las pruebas.',
'prueba', 'publicada', 'amateur',
'Badajoz', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-07-31 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- CASTELLÓN
('opp_cas_001',
'Base masculino — Tercera FEB Comunitat Valenciana',
'tercera-feb-castellon-base-masculino-2026',
'Club de Tercera FEB en la provincia de Castellón busca Base para reforzar su plantilla 2026/27.

Perfil:
- Base con experiencia autonómica o en Tercera FEB
- Liderazgo en pista y buena toma de decisiones
- Disponibilidad en Castellón o alrededores

Proyecto en crecimiento con buen ambiente de trabajo.

CV deportivo a nuestro correo.',
'empleo', 'publicada', 'amateur',
'Castellón', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- HUELVA
('opp_hue_001',
'Escolta femenina — Primera Nacional Huelva',
'primera-nacional-huelva-escolta-femenino-2026',
'Club onubense de Primera Nacional femenina busca Escolta para 2026/27.

Perfil buscado:
- Escolta con buen tiro y actitud defensiva
- Experiencia en autonómica o primera nacional
- Comprometida y con ganas de crecer
- Disponibilidad en Huelva

Proyecto consolidado en la zona.

CV deportivo con estadísticas.',
'empleo', 'publicada', 'amateur',
'Huelva', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-10 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- TARRAGONA
('opp_tar_001',
'Alero masculino — Primera Autonómica Cataluña',
'primera-autonomica-cataluna-tarragona-alero-2026',
'Club catalán de Primera Autonómica masculina en Tarragona busca Alero para completar plantilla 2026/27.

Buscamos:
- Alero entre 1.90 y 1.98m
- Experiencia autonómica
- Disponibilidad en la provincia de Tarragona
- Carácter competitivo y trabajo en equipo

Proyecto estable con buenas instalaciones.

CV deportivo y disponibilidad.',
'empleo', 'publicada', 'amateur',
'Tarragona', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-09-15 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW()),

-- GIJÓN / ASTURIAS
('opp_gij_001',
'Pívot femenina — Segunda FEB Asturias',
'segunda-feb-asturias-pivot-femenino-2026',
'Club asturiano de Segunda FEB femenino busca Pívot para la temporada 2026/27.

Perfil:
- Pívot con presencia física y dominio del juego interior
- Experiencia en Primera Nacional o Segunda FEB
- Posibilidad de ayuda con alojamiento para candidatas de fuera
- Disponibilidad en el área de Gijón/Oviedo

Condiciones según nivel de la candidata.

Envía CV deportivo completo con historial y estadísticas.',
'empleo', 'publicada', 'semi_profesional',
'Gijón', 'España', 'presencial',
'hola@workhoops.com', NOW(), '2026-08-20 23:59:59',
'cmh63xs6i0000z3nbrrgdsrtx', 'org_workhoops_scouting',
true, NOW(), NOW())

ON CONFLICT (slug) DO NOTHING;

-- Verificar inserción
SELECT COUNT(*) as total_ofertas_insertadas FROM opportunities 
WHERE "authorId" = 'cmh63xs6i0000z3nbrrgdsrtx';

