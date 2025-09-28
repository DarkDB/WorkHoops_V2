import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/articles/slug/${slug}`);
      setArticle(response.data);
      
      // Fetch related articles
      if (response.data.categoria) {
        const relatedResponse = await axios.get(`${BACKEND_URL}/api/articles?categoria=${response.data.categoria}&limit=3`);
        setRelatedArticles(relatedResponse.data.filter(a => a.id !== response.data.id));
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('No se pudo cargar el artículo');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: article.titulo,
        text: article.extracto,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to copy URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const formatContent = (content) => {
    // Simple markdown-like formatting
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('# ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-900 mb-4 mt-8">
              {paragraph.replace('# ', '')}
            </h2>
          );
        }
        if (paragraph.startsWith('## ')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-6">
              {paragraph.replace('## ', '')}
            </h3>
          );
        }
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').map(item => item.replace('- ', '')).filter(item => item);
          return (
            <ul key={index} className="list-disc pl-6 mb-6 space-y-1">
              {items.map((item, itemIndex) => (
                <li key={itemIndex} className="text-gray-700">{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {paragraph}
          </p>
        );
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
            <p className="text-gray-600 mb-6">El artículo que buscas no existe o ha sido eliminado.</p>
            <Link to="/recursos">
              <Button>Volver a recursos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="article-detail-page">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/recursos" className="hover:text-orange-600 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Recursos
          </Link>
          <span>/</span>
          <span className="text-gray-900">{article.titulo}</span>
        </div>

        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          {article.portada && (
            <div className="h-64 md:h-96 overflow-hidden">
              <img
                src={article.portada}
                alt={article.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Meta information */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <Badge className="bg-orange-100 text-orange-800">
                  {article.categoria}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {getReadingTime(article.cuerpo)} min de lectura
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                data-testid="share-article"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="article-title">
              {article.titulo}
            </h1>

            {/* Excerpt */}
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {article.extracto}
            </p>

            {/* Author and date */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-8">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {article.autor}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(article.fecha_publicacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Content */}
            <div className="prose prose-gray max-w-none" data-testid="article-content">
              {formatContent(article.cuerpo)}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <>
                <Separator className="my-8" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tags relacionados</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Artículos relacionados
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Card key={related.id} className="hover:shadow-lg transition-shadow">
                  {related.portada && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={related.portada}
                        alt={related.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {related.categoria}
                    </Badge>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {related.titulo}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {related.extracto}
                    </p>
                    
                    <Link to={`/recursos/${related.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Leer más
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Back to resources */}
        <div className="mt-12 text-center">
          <Link to="/recursos">
            <Button variant="outline" className="px-8">
              <BookOpen className="w-4 h-4 mr-2" />
              Ver más recursos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;