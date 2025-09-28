#!/usr/bin/env python3
"""
Script to populate WorkHoops database with sample data
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing data
    print("Clearing existing data...")
    await db.organizations.delete_many({})
    await db.opportunities.delete_many({})
    await db.users.delete_many({})
    await db.articles.delete_many({})
    await db.testimonials.delete_many({})
    await db.plans.delete_many({})
    
    # Organizations
    organizations = [
        {
            "id": "org-1",
            "nombre": "FC Barcelona Basquet",
            "logo": "https://images.unsplash.com/photo-1546519638-68e109498ffc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsfGVufDB8fHx8MTc1OTA4ODc3OXww&ixlib=rb-4.1.0&q=85",
            "web": "https://www.fcbarcelona.com",
            "bio": "Club de baloncesto profesional con sede en Barcelona, parte del FC Barcelona.",
            "verificada": True,
            "redes": {"twitter": "@fcbarcelona", "instagram": "@fcbarcelona"},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "org-2", 
            "nombre": "Real Madrid Baloncesto",
            "logo": "https://images.unsplash.com/photo-1519861531473-9200262188bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxiYXNrZXRiYWxsfGVufDB8fHx8MTc1OTA4ODc3OXww&ixlib=rb-4.1.0&q=85",
            "web": "https://www.realmadrid.com",
            "bio": "Sección de baloncesto del Real Madrid Club de Fútbol.",
            "verificada": True,
            "redes": {"twitter": "@RMBaloncesto", "instagram": "@realmadrid"},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "org-3",
            "nombre": "Valencia Basket",
            "logo": "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxiYXNrZXRiYWxsfGVufDB8fHx8MTc1OTA4ODc3OXww&ixlib=rb-4.1.0&q=85",
            "web": "https://valenciabasket.com",
            "bio": "Club profesional de baloncesto de Valencia, actualmente en ACB y EuroCup.",
            "verificada": True,
            "redes": {"twitter": "@valenciabasket", "instagram": "@valenciabasket"},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "org-4",
            "nombre": "CB Estudiantes",
            "web": "https://estudiantes.com",
            "bio": "Club Baloncesto Estudiantes, histórico club madrileño fundado en 1948.",
            "verificada": True,
            "redes": {"twitter": "@CBEstudiantes"},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "org-5",
            "nombre": "Joventut Badalona",
            "web": "https://penya.cat",
            "bio": "Club Joventut Badalona, la Penya, con más de 90 años de historia.",
            "verificada": True,
            "redes": {"twitter": "@lapenyadebadalo", "instagram": "@lapenyadebadalona"},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "org-6",
            "nombre": "Academia BSK",
            "bio": "Academia de baloncesto para jóvenes talentos en Barcelona.",
            "verificada": False,
            "redes": {},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "org-7",
            "nombre": "Federación Catalana de Basquet",
            "web": "https://fcbq.cat",
            "bio": "Organismo rector del baloncesto en Cataluña.",
            "verificada": True,
            "redes": {"twitter": "@fcbq", "instagram": "@fcbq"},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "org-8",
            "nombre": "Unicaja Baloncesto",
            "web": "https://unicajabaloncesto.com",
            "bio": "Club profesional de baloncesto con sede en Málaga.",
            "verificada": True,
            "redes": {"twitter": "@unicajabalonces", "instagram": "@unicajabaloncesto"},
            "fecha_creacion": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Opportunities
    opportunities = [
        {
            "id": "opp-1",
            "titulo": "Entrenador Cantera Masculina U16",
            "slug": "entrenador-cantera-masculina-u16-barcelona",
            "tipo": "empleo",
            "organizacion_id": "org-1",
            "organizacion_nombre": "FC Barcelona Basquet",
            "ubicacion": "Barcelona, España",
            "lat": 41.3851,
            "lng": 2.1734,
            "modalidad": "presencial",
            "nivel": "cantera",
            "remuneracion": "30.000€ - 40.000€ anuales",
            "beneficios": "Seguro médico, formación continua, material deportivo",
            "fecha_publicacion": datetime.now(timezone.utc).isoformat(),
            "fecha_limite": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "descripcion": "Buscamos entrenador con experiencia para dirigir nuestro equipo U16 masculino. Responsabilidades incluyen planificación de entrenamientos, desarrollo de jugadores y competición en Liga Autonómica.",
            "requisitos": "Título de Entrenador Superior, experiencia mínima 3 años en cantera, inglés conversacional",
            "contacto": "rrhh@fcbarcelona.com",
            "verificacion": True,
            "estado": "publicada",
            "tags": ["entrenador", "cantera", "barcelona", "masculino"],
            "cupos": 1
        },
        {
            "id": "opp-2",
            "titulo": "Pruebas Equipo Femenino Senior",
            "slug": "pruebas-equipo-femenino-senior-valencia",
            "tipo": "prueba",
            "organizacion_id": "org-3",
            "organizacion_nombre": "Valencia Basket",
            "ubicacion": "Valencia, España",
            "lat": 39.4699,
            "lng": -0.3763,
            "modalidad": "presencial",
            "nivel": "semi-pro",
            "beneficios": "Seguro deportivo, material, posibilidad contrato",
            "fecha_publicacion": datetime.now(timezone.utc).isoformat(),
            "fecha_limite": (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
            "descripcion": "Convocamos pruebas para completar la plantilla del equipo femenino senior para la temporada 2024/25. Buscamos jugadoras con experiencia en competición federada.",
            "requisitos": "Edad 18-28 años, experiencia en liga autonómica o superior, altura mínima 1.70m preferible",
            "contacto": "secretaria@valenciabasket.com",
            "verificacion": True,
            "estado": "publicada",
            "tags": ["prueba", "femenino", "valencia", "senior"],
            "cupos": 15
        },
        {
            "id": "opp-3",
            "titulo": "Torneo 3x3 Sabadell Open",
            "slug": "torneo-3x3-sabadell-open",
            "tipo": "torneo",
            "organizacion_id": "org-6",
            "organizacion_nombre": "Academia BSK",
            "ubicacion": "Sabadell, Barcelona",
            "modalidad": "presencial",
            "nivel": "amateur",
            "remuneracion": "Premios hasta 1.500€",
            "fecha_publicacion": datetime.now(timezone.utc).isoformat(),
            "fecha_limite": (datetime.now(timezone.utc) + timedelta(days=20)).isoformat(),
            "descripcion": "Torneo de baloncesto 3x3 abierto a todas las categorías. Formato eliminatoria directa con premios para los 3 primeros clasificados de cada categoría.",
            "requisitos": "Equipos de 4 jugadores (3 titulares + 1 suplente), seguro deportivo vigente",
            "contacto": "info@academiabsk.com",
            "verificacion": False,
            "estado": "publicada",
            "tags": ["torneo", "3x3", "sabadell", "amateur", "abierto"],
            "cupos": 32,
            "enlace_externo": "https://academiabsk.com/torneo-3x3"
        },
        {
            "id": "opp-4",
            "titulo": "Beca Estudios + Baloncesto Estados Unidos",
            "slug": "beca-estudios-baloncesto-estados-unidos",
            "tipo": "beca",
            "organizacion_id": "org-7",
            "organizacion_nombre": "Federación Catalana de Basquet",
            "ubicacion": "California, Estados Unidos",
            "modalidad": "presencial",
            "nivel": "amateur",
            "beneficios": "Matrícula universitaria, alojamiento, manutención, entrenamiento",
            "fecha_publicacion": datetime.now(timezone.utc).isoformat(),
            "fecha_limite": (datetime.now(timezone.utc) + timedelta(days=60)).isoformat(),
            "descripcion": "Programa de becas para jugadores catalanes con potencial para estudiar y jugar al baloncesto en universidades americanas. Incluye preparación académica y deportiva.",
            "requisitos": "Edad 16-18 años, nivel B2 inglés, expediente académico notable, altura mínima 1.80m (masculino) / 1.70m (femenino)",
            "contacto": "becas@fcbq.cat",
            "verificacion": True,
            "estado": "publicada",
            "tags": ["beca", "estados-unidos", "universidad", "internacional"],
            "cupos": 5
        },
        {
            "id": "opp-5",
            "titulo": "Fisioterapeuta Deportivo",
            "slug": "fisioterapeuta-deportivo-estudiantes",
            "tipo": "empleo",
            "organizacion_id": "org-4",
            "organizacion_nombre": "CB Estudiantes",
            "ubicacion": "Madrid, España",
            "modalidad": "presencial",
            "nivel": "profesional",
            "remuneracion": "35.000€ - 45.000€ anuales",
            "beneficios": "Seguro médico, formación continua, horario flexible",
            "fecha_publicacion": datetime.now(timezone.utc).isoformat(),
            "fecha_limite": (datetime.now(timezone.utc) + timedelta(days=45)).isoformat(),
            "descripcion": "Incorporación inmediata de fisioterapeuta para el equipo profesional y cantera. Trabajo en prevención de lesiones, recuperación y puesta a punto de jugadores.",
            "requisitos": "Grado en Fisioterapia, Máster en Fisioterapia Deportiva preferible, experiencia en deporte de élite",
            "contacto": "medico@estudiantes.com",
            "verificacion": True,
            "estado": "publicada",
            "tags": ["fisio", "madrid", "profesional", "estudiantes"],
            "cupos": 1
        },
        {
            "id": "opp-6",
            "titulo": "Patrocinio Equipo Femenino LF2",
            "slug": "patrocinio-equipo-femenino-lf2",
            "tipo": "patrocinio",
            "organizacion_id": "org-5",
            "organizacion_nombre": "Joventut Badalona",
            "ubicacion": "Badalona, Barcelona",
            "modalidad": "presencial",
            "nivel": "semi-pro",
            "beneficios": "Visibilidad en Liga Femenina 2, naming rights, activaciones",
            "fecha_publicacion": datetime.now(timezone.utc).isoformat(),
            "fecha_limite": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
            "descripcion": "Oportunidad de patrocinio para nuestro equipo femenino que compite en Liga Femenina 2. Ofrecemos diferentes paquetes de patrocinio con gran visibilidad.",
            "requisitos": "Empresa registrada en España, propuesta de patrocinio mínimo 15.000€/temporada",
            "contacto": "marketing@penya.cat",
            "verificacion": True,
            "estado": "publicada",
            "tags": ["patrocinio", "femenino", "lf2", "badalona"],
            "cupos": 3
        }
    ]
    
    # Articles
    articles = [
        {
            "id": "art-1",
            "titulo": "Cómo prepararse para una prueba de baloncesto",
            "slug": "como-prepararse-prueba-baloncesto",
            "extracto": "Guía completa para afrontar con éxito las pruebas de selección en clubs de baloncesto.",
            "portada": "https://images.pexels.com/photos/6763716/pexels-photo-6763716.jpeg",
            "cuerpo": "# Preparación física y mental\n\nLas pruebas de baloncesto requieren una preparación integral que abarca aspectos físicos, técnicos y mentales...\n\n## Aspectos técnicos clave\n\n- Fundamentos individuales\n- Tiro exterior\n- Penetraciones\n- Defensa individual\n\n## Preparación física\n\nUn mes antes de la prueba, enfócate en:\n- Resistencia cardiovascular\n- Fuerza explosiva\n- Agilidad y coordinación",
            "categoria": "Consejos",
            "autor": "Carlos Martínez",
            "fecha_publicacion": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "art-2",
            "titulo": "Plantilla de CV deportivo para jugadores",
            "slug": "plantilla-cv-deportivo-jugadores",
            "extracto": "Descarga nuestra plantilla gratuita para crear un CV deportivo que destaque tu talento.",
            "portada": "https://images.pexels.com/photos/6763758/pexels-photo-6763758.jpeg",
            "cuerpo": "# Tu curriculum deportivo\n\nUn buen CV deportivo debe incluir:\n\n## Datos personales\n- Información de contacto\n- Posición y características físicas\n- Disponibilidad\n\n## Experiencia deportiva\n- Equipos anteriores\n- Logros y estadísticas\n- Referencias de entrenadores",
            "categoria": "Recursos",
            "autor": "Ana López",
            "fecha_publicacion": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
        }
    ]
    
    # Testimonials
    testimonials = [
        {
            "id": "test-1",
            "nombre": "Marc Ribas",
            "rol": "Jugador profesional",
            "texto": "Gracias a WorkHoops encontré mi oportunidad en el Valencia Basket. La plataforma me permitió conectar directamente con el club.",
            "foto": "https://images.unsplash.com/photo-1628779238951-be2c9f2a59f4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxzcG9ydHN8ZW58MHx8fHwxNzU5MDg4Nzg5fDA&ixlib=rb-4.1.0&q=85"
        },
        {
            "id": "test-2",
            "nombre": "Laura Sánchez",
            "rol": "Entrenadora",
            "texto": "Como entrenadora, WorkHoops me ha ayudado a encontrar las mejores oportunidades y conectar con clubs que valoran mi experiencia.",
            "foto": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxzcG9ydHN8ZW58MHx8fHwxNzU5MDg4Nzg5fDA&ixlib=rb-4.1.0&q=85"
        }
    ]
    
    # Plans
    plans = [
        {
            "id": "plan-1",
            "nombre": "Gratis",
            "precio": 0.0,
            "beneficios": ["Publicación básica", "Visibilidad 30 días", "Soporte email"],
            "limite_publicaciones": 1,
            "destacar": False
        },
        {
            "id": "plan-2",
            "nombre": "Destacado",
            "precio": 49.0,
            "beneficios": ["Publicación destacada", "Visibilidad 60 días", "Promoción redes sociales", "Soporte prioritario"],
            "limite_publicaciones": 3,
            "destacar": True
        },
        {
            "id": "plan-3",
            "nombre": "Patrocinado",
            "precio": 99.0,
            "beneficios": ["Banner principal", "Newsletter dedicada", "Visibilidad 90 días", "Promoción redes sociales", "Soporte telefónico"],
            "limite_publicaciones": 10,
            "destacar": False
        }
    ]
    
    # Insert data
    print("Inserting organizations...")
    await db.organizations.insert_many(organizations)
    
    print("Inserting opportunities...")
    await db.opportunities.insert_many(opportunities)
    
    print("Inserting articles...")
    await db.articles.insert_many(articles)
    
    print("Inserting testimonials...")
    await db.testimonials.insert_many(testimonials)
    
    print("Inserting plans...")
    await db.plans.insert_many(plans)
    
    print("✅ Database seeded successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())