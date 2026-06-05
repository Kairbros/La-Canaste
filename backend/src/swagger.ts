const PORT = process.env['PORT'] ?? 4000

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Canasta Minimercado',
    version: '1.0.0',
    description:
      'API REST para la gestión del minimercado: autenticación, categorías, productos, pedidos y estadísticas.',
  },
  servers: [{ url: `http://localhost:${PORT}`, description: 'Servidor local' }],
  tags: [
    { name: 'Auth', description: 'Autenticación y registro de usuarios' },
    { name: 'Categories', description: 'Gestión de categorías' },
    { name: 'Products', description: 'Gestión de productos' },
    { name: 'Orders', description: 'Gestión de pedidos' },
    { name: 'Stats', description: 'Estadísticas (requiere rol ADMIN)' },
    { name: 'Config', description: 'Configuración de la tienda y cobertura de domicilios' },
    { name: 'Users', description: 'Gestión de usuarios y domiciliarios (ADMIN)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Mensaje de error' } },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', example: 'juan@example.com' },
          role: { type: 'string', enum: ['ADMIN', 'DOMICILIARIO', 'CLIENTE'], example: 'CLIENTE' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Lácteos' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Leche entera 1L' },
          price: { type: 'number', format: 'float', example: 4500 },
          image: { type: 'string', nullable: true, example: 'https://...' },
          available: { type: 'boolean', example: true },
          categoryId: { type: 'integer', example: 1 },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          orderId: { type: 'integer', example: 1 },
          productId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', example: 2 },
          unitPrice: { type: 'number', format: 'float', example: 4500 },
        },
      },
      Config: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          coverageRadius: { type: 'number', format: 'float', example: 2.0, description: 'Radio de cobertura en km' },
          storeLat: { type: 'number', format: 'float', example: 4.60971 },
          storeLng: { type: 'number', format: 'float', example: -74.08175 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          clientName: { type: 'string', example: 'Juan Pérez' },
          address: { type: 'string', example: 'Calle 10 #5-20' },
          phone: { type: 'string', example: '3001234567' },
          status: {
            type: 'string',
            enum: ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'],
            example: 'PENDIENTE',
          },
          total: { type: 'number', format: 'float', example: 9000 },
          latitude: { type: 'number', format: 'float', nullable: true, example: 4.61 },
          longitude: { type: 'number', format: 'float', nullable: true, example: -74.08 },
          deliveryId: { type: 'integer', nullable: true, example: 2 },
          delivery: { type: 'object', nullable: true, properties: { id: { type: 'integer' }, name: { type: 'string' } } },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Auth'],
        summary: 'Verificar estado del servidor',
        responses: { 200: { description: 'Servidor operativo' } },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar un nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Juan Pérez' },
                  email: { type: 'string', example: 'juan@example.com' },
                  password: { type: 'string', example: 'secret123' },
                  role: { type: 'string', enum: ['ADMIN', 'DOMICILIARIO', 'CLIENTE'], example: 'CLIENTE' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          400: { description: 'El correo ya está registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'juan@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Listar categorías (con sus productos)',
        responses: { 200: { description: 'Lista de categorías', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } },
      },
      post: {
        tags: ['Categories'],
        summary: 'Crear categoría',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'Lácteos' } } } } },
        },
        responses: { 201: { description: 'Categoría creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } } },
      },
    },
    '/api/categories/{id}': {
      put: {
        tags: ['Categories'],
        summary: 'Actualizar categoría',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string', example: 'Bebidas' } } } } },
        },
        responses: { 200: { description: 'Categoría actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } } },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Eliminar categoría',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Categoría eliminada' } },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Listar productos (con su categoría)',
        responses: { 200: { description: 'Lista de productos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } },
      },
      post: {
        tags: ['Products'],
        summary: 'Crear producto',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'categoryId'],
                properties: {
                  name: { type: 'string', example: 'Leche entera 1L' },
                  price: { type: 'number', example: 4500 },
                  image: { type: 'string', example: 'https://...' },
                  available: { type: 'boolean', example: true },
                  categoryId: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Producto creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } } },
      },
    },
    '/api/products/category/{categoryId}': {
      get: {
        tags: ['Products'],
        summary: 'Listar productos disponibles por categoría',
        parameters: [{ name: 'categoryId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Lista de productos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } } } },
      },
    },
    '/api/products/{id}': {
      put: {
        tags: ['Products'],
        summary: 'Actualizar producto',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  image: { type: 'string' },
                  available: { type: 'boolean' },
                  categoryId: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Producto actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Eliminar producto',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Producto eliminado' } },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Listar pedidos',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de pedidos', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Crear pedido',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['clientName', 'address', 'phone', 'items'],
                properties: {
                  clientName: { type: 'string', example: 'Juan Pérez' },
                  address: { type: 'string', example: 'Calle 10 #5-20' },
                  phone: { type: 'string', example: '3001234567' },
                  latitude: { type: 'number', example: 4.61, description: 'Opcional; si se envía, se valida la cobertura' },
                  longitude: { type: 'number', example: -74.08 },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity', 'unitPrice'],
                      properties: {
                        productId: { type: 'integer', example: 1 },
                        quantity: { type: 'integer', example: 2 },
                        unitPrice: { type: 'number', example: 4500 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pedido creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          400: { description: 'Faltan datos del pedido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Obtener pedido por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Pedido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          404: { description: 'Pedido no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Actualizar estado del pedido',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'],
                    example: 'EN_CAMINO',
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Pedido actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } } },
      },
    },
    '/api/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Obtener estadísticas',
        description: 'Requiere autenticación con token JWT y rol ADMIN.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Estadísticas (incluye salesByDay: serie de ventas de los últimos 14 días)' },
          401: { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          403: { description: 'No autorizado (requiere ADMIN)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/orders/mine': {
      get: {
        tags: ['Orders'],
        summary: 'Pedidos asignados al domiciliario autenticado',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de pedidos asignados', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } },
      },
    },
    '/api/orders/{id}/assign': {
      patch: {
        tags: ['Orders'],
        summary: 'Asignar (o desasignar) un domiciliario a un pedido',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { deliveryId: { type: 'integer', nullable: true, example: 2, description: 'ID del domiciliario, o null para desasignar' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Pedido actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } } },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios (filtrable por rol)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'role', in: 'query', required: false, schema: { type: 'string', enum: ['ADMIN', 'DOMICILIARIO', 'CLIENTE'] }, example: 'DOMICILIARIO' }],
        responses: { 200: { description: 'Lista de usuarios', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } },
      },
      post: {
        tags: ['Users'],
        summary: 'Crear usuario (p.ej. domiciliario)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Carlos Repartidor' },
                  email: { type: 'string', example: 'carlos@test.com' },
                  password: { type: 'string', example: 'secret123' },
                  role: { type: 'string', enum: ['ADMIN', 'DOMICILIARIO', 'CLIENTE'], example: 'DOMICILIARIO' },
                  phone: { type: 'string', example: '3009998888' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } } },
      },
    },
    '/api/users/{id}': {
      delete: {
        tags: ['Users'],
        summary: 'Eliminar usuario',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Usuario eliminado' } },
      },
    },
    '/api/config': {
      get: {
        tags: ['Config'],
        summary: 'Obtener configuración de la tienda',
        responses: { 200: { description: 'Configuración', content: { 'application/json': { schema: { $ref: '#/components/schemas/Config' } } } } },
      },
      put: {
        tags: ['Config'],
        summary: 'Actualizar configuración de la tienda',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  coverageRadius: { type: 'number', example: 3.0 },
                  storeLat: { type: 'number', example: 4.60971 },
                  storeLng: { type: 'number', example: -74.08175 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Configuración actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Config' } } } } },
      },
    },
    '/api/config/coverage': {
      get: {
        tags: ['Config'],
        summary: 'Verificar si unas coordenadas están dentro de la cobertura',
        parameters: [
          { name: 'lat', in: 'query', required: true, schema: { type: 'number' }, example: 4.61 },
          { name: 'lng', in: 'query', required: true, schema: { type: 'number' }, example: -74.08 },
        ],
        responses: {
          200: {
            description: 'Resultado de cobertura',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    covered: { type: 'boolean', example: true },
                    distance: { type: 'number', example: 1.23 },
                    coverageRadius: { type: 'number', example: 2.0 },
                  },
                },
              },
            },
          },
          400: { description: 'Parámetros faltantes', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
}
