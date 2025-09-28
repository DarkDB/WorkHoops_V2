from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from enum import Enum
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="WorkHoops API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class OpportunityType(str, Enum):
    EMPLEO = "empleo"
    PRUEBA = "prueba"
    TORNEO = "torneo"
    CLINICA = "clinica"
    BECA = "beca"
    PATROCINIO = "patrocinio"

class UserRole(str, Enum):
    JUGADOR = "jugador"
    ENTRENADOR = "entrenador"
    FISIO = "fisio"
    ARBITRO = "arbitro"
    STAFF = "staff"

class OpportunityLevel(str, Enum):
    AMATEUR = "amateur"
    SEMI_PRO = "semi-pro"
    CANTERA = "cantera"
    PROFESIONAL = "profesional"

class OpportunityStatus(str, Enum):
    BORRADOR = "borrador"
    PENDIENTE = "pendiente"
    PUBLICADA = "publicada"
    CERRADA = "cerrada"

# Helper functions
def prepare_for_mongo(data):
    """Prepare data for MongoDB storage"""
    if isinstance(data, dict):
        prepared = {}
        for key, value in data.items():
            if isinstance(value, datetime):
                prepared[key] = value.isoformat()
            elif isinstance(value, dict):
                prepared[key] = prepare_for_mongo(value)
            elif isinstance(value, list):
                prepared[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
            else:
                prepared[key] = value
        return prepared
    return data

def parse_from_mongo(item):
    """Parse data from MongoDB"""
    if isinstance(item, dict):
        parsed = {}
        for key, value in item.items():
            if key.endswith('_fecha') or key in ['fecha_publicacion', 'fecha_limite', 'timestamp']:
                if isinstance(value, str):
                    try:
                        parsed[key] = datetime.fromisoformat(value)
                    except:
                        parsed[key] = value
                else:
                    parsed[key] = value
            else:
                parsed[key] = value
        return parsed
    return item

# Models
class Organization(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    logo: Optional[str] = None
    web: Optional[str] = None
    bio: Optional[str] = None
    verificada: bool = False
    redes: Optional[Dict[str, str]] = {}
    fecha_creacion: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrganizationCreate(BaseModel):
    nombre: str
    logo: Optional[str] = None
    web: Optional[str] = None
    bio: Optional[str] = None
    redes: Optional[Dict[str, str]] = {}

class Opportunity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    slug: str
    tipo: OpportunityType
    organizacion_id: str
    organizacion_nombre: str
    ubicacion: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    modalidad: str = "presencial"  # presencial, online, hibrida
    nivel: OpportunityLevel
    remuneracion: Optional[str] = None
    beneficios: Optional[str] = None
    fecha_publicacion: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    fecha_limite: Optional[datetime] = None
    descripcion: str
    requisitos: Optional[str] = None
    contacto: EmailStr
    verificacion: bool = False
    estado: OpportunityStatus = OpportunityStatus.PENDIENTE
    tags: List[str] = []
    cupos: Optional[int] = None
    enlace_externo: Optional[str] = None

class OpportunityCreate(BaseModel):
    titulo: str
    tipo: OpportunityType
    organizacion_id: str
    organizacion_nombre: str
    ubicacion: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    modalidad: str = "presencial"
    nivel: OpportunityLevel
    remuneracion: Optional[str] = None
    beneficios: Optional[str] = None
    fecha_limite: Optional[datetime] = None
    descripcion: str
    requisitos: Optional[str] = None
    contacto: EmailStr
    tags: List[str] = []
    cupos: Optional[int] = None
    enlace_externo: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    email: EmailStr
    rol: UserRole
    posicion: Optional[str] = None
    altura: Optional[int] = None  # en cm
    ciudad: str
    highlights_url: Optional[str] = None
    bio: Optional[str] = None
    foto: Optional[str] = None
    disponibilidad_viajar: bool = True
    verificado: bool = False
    fecha_registro: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    rol: UserRole
    posicion: Optional[str] = None
    altura: Optional[int] = None
    ciudad: str
    highlights_url: Optional[str] = None
    bio: Optional[str] = None
    foto: Optional[str] = None
    disponibilidad_viajar: bool = True

class Article(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    slug: str
    extracto: str
    portada: Optional[str] = None
    cuerpo: str
    categoria: str
    autor: str
    fecha_publicacion: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArticleCreate(BaseModel):
    titulo: str
    extracto: str
    portada: Optional[str] = None
    cuerpo: str
    categoria: str
    autor: str

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    rol: str
    texto: str
    foto: Optional[str] = None

class TestimonialCreate(BaseModel):
    nombre: str
    rol: str
    texto: str
    foto: Optional[str] = None

class Plan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    precio: float
    beneficios: List[str]
    limite_publicaciones: Optional[int] = None
    destacar: bool = False

class NewsletterSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    fecha_suscripcion: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    activa: bool = True

class ContactForm(BaseModel):
    nombre: str
    email: EmailStr
    categoria: str
    mensaje: str
    fecha_envio: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Routes

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "WorkHoops API", "version": "1.0.0"}

# Organizations endpoints
@api_router.get("/organizations", response_model=List[Organization])
async def get_organizations():
    orgs = await db.organizations.find().to_list(length=None)
    return [Organization(**parse_from_mongo(org)) for org in orgs]

@api_router.post("/organizations", response_model=Organization)
async def create_organization(org: OrganizationCreate):
    org_dict = org.dict()
    org_obj = Organization(**org_dict)
    # Generate slug from name
    org_obj.slug = org_obj.nombre.lower().replace(' ', '-').replace('/', '-')
    await db.organizations.insert_one(prepare_for_mongo(org_obj.dict()))
    return org_obj

@api_router.get("/organizations/{org_id}", response_model=Organization)
async def get_organization(org_id: str):
    org = await db.organizations.find_one({"id": org_id})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return Organization(**parse_from_mongo(org))

# Opportunities endpoints
@api_router.get("/opportunities", response_model=List[Opportunity])
async def get_opportunities(
    tipo: Optional[OpportunityType] = None,
    nivel: Optional[OpportunityLevel] = None,
    ubicacion: Optional[str] = None,
    estado: Optional[OpportunityStatus] = None,
    limit: int = Query(20, le=100),
    offset: int = 0
):
    filters = {}
    if tipo:
        filters["tipo"] = tipo
    if nivel:
        filters["nivel"] = nivel
    if ubicacion:
        filters["ubicacion"] = {"$regex": ubicacion, "$options": "i"}
    if estado:
        filters["estado"] = estado
    else:
        filters["estado"] = OpportunityStatus.PUBLICADA  # Default to published only
    
    opportunities = await db.opportunities.find(filters).skip(offset).limit(limit).to_list(length=None)
    return [Opportunity(**parse_from_mongo(opp)) for opp in opportunities]

@api_router.post("/opportunities", response_model=Opportunity)
async def create_opportunity(opp: OpportunityCreate):
    opp_dict = opp.dict()
    opp_obj = Opportunity(**opp_dict)
    # Generate slug from title
    opp_obj.slug = opp_obj.titulo.lower().replace(' ', '-').replace('/', '-')
    await db.opportunities.insert_one(prepare_for_mongo(opp_obj.dict()))
    return opp_obj

@api_router.get("/opportunities/{opp_id}", response_model=Opportunity)
async def get_opportunity(opp_id: str):
    opp = await db.opportunities.find_one({"id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return Opportunity(**parse_from_mongo(opp))

@api_router.get("/opportunities/slug/{slug}", response_model=Opportunity)
async def get_opportunity_by_slug(slug: str):
    opp = await db.opportunities.find_one({"slug": slug})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return Opportunity(**parse_from_mongo(opp))

# Users endpoints
@api_router.get("/users", response_model=List[User])
async def get_users(rol: Optional[UserRole] = None, limit: int = Query(20, le=100)):
    filters = {}
    if rol:
        filters["rol"] = rol
    
    users = await db.users.find(filters).limit(limit).to_list(length=None)
    return [User(**parse_from_mongo(user)) for user in users]

@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    user_dict = user.dict()
    user_obj = User(**user_dict)
    await db.users.insert_one(prepare_for_mongo(user_obj.dict()))
    return user_obj

# Articles endpoints
@api_router.get("/articles", response_model=List[Article])
async def get_articles(categoria: Optional[str] = None, limit: int = Query(10, le=50)):
    filters = {}
    if categoria:
        filters["categoria"] = categoria
    
    articles = await db.articles.find(filters).limit(limit).to_list(length=None)
    return [Article(**parse_from_mongo(article)) for article in articles]

@api_router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    article = await db.articles.find_one({"id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return Article(**parse_from_mongo(article))

@api_router.get("/articles/slug/{slug}", response_model=Article)
async def get_article_by_slug(slug: str):
    article = await db.articles.find_one({"slug": slug})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return Article(**parse_from_mongo(article))

# Testimonials endpoints
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials():
    testimonials = await db.testimonials.find().to_list(length=None)
    return [Testimonial(**testimonial) for testimonial in testimonials]

# Plans endpoints
@api_router.get("/plans", response_model=List[Plan])
async def get_plans():
    plans = await db.plans.find().to_list(length=None)
    return [Plan(**plan) for plan in plans]

# Newsletter subscription
@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(email: EmailStr):
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return JSONResponse({"message": "Ya estás suscrito a nuestra newsletter"})
    
    subscription = NewsletterSubscription(email=email)
    await db.newsletter.insert_one(prepare_for_mongo(subscription.dict()))
    return JSONResponse({"message": "¡Te has suscrito correctamente!"})

# Contact form
@api_router.post("/contact")
async def contact_form(form: ContactForm):
    await db.contact_forms.insert_one(prepare_for_mongo(form.dict()))
    return JSONResponse({"message": "Mensaje enviado correctamente. Te responderemos pronto."})

# Search endpoint
@api_router.get("/search")
async def search(q: str, tipo: Optional[str] = None):
    results = {}
    
    # Search opportunities
    opp_filters = {"$text": {"$search": q}, "estado": OpportunityStatus.PUBLICADA}
    if tipo and tipo in ["oportunidades"]:
        opportunities = await db.opportunities.find(opp_filters).limit(10).to_list(length=None)
        results["opportunities"] = [Opportunity(**parse_from_mongo(opp)) for opp in opportunities]
    
    # Search articles
    if not tipo or tipo == "articulos":
        articles = await db.articles.find({"$text": {"$search": q}}).limit(5).to_list(length=None)
        results["articles"] = [Article(**parse_from_mongo(article)) for article in articles]
    
    return results

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    # Create text indexes for search
    try:
        await db.opportunities.create_index([("titulo", "text"), ("descripcion", "text")])
        await db.articles.create_index([("titulo", "text"), ("cuerpo", "text")])
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()