# Gooes Backend — API

> Ticketing SaaS — Node.js · Express · MongoDB · Stripe

---

## Estrutura de pastas

```
gooes-backend/
├── src/
│   ├── server.js              # Entrada principal
│   ├── config/
│   │   └── database.js        # Conexão MongoDB
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Event.model.js
│   │   └── Order.model.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── order.controller.js
│   │   └── payment.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js   # JWT + authorize
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── order.routes.js
│   │   └── payment.routes.js
│   ├── services/
│   │   └── api.js              # (frontend) camada de serviços
│   └── utils/
│       └── seed.js             # Dados de exemplo
├── .env.example
├── package.json
└── README.md
```

---

## Setup local

### Pré-requisitos
- Node.js 18+
- MongoDB local ou conta no [MongoDB Atlas](https://cloud.mongodb.com) (gratuito)
- Conta no [Stripe](https://stripe.com) para pagamentos reais (opcional em dev)

### 1. Instalar dependências

```bash
cd gooes-backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gooes
JWT_SECRET=uma_string_aleatoria_e_longa
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

### 3. Popular banco com dados de exemplo

```bash
npm run seed
```

Credenciais criadas:
| Role       | Email                  | Senha    |
|------------|------------------------|----------|
| Organizador | admin@gooes.com.br    | gooes123 |
| Comprador   | joao@teste.com        | teste123 |

### 4. Iniciar o servidor

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start
```

API disponível em: `http://localhost:5000`

---

## Endpoints da API

### Auth
| Método | Rota             | Auth | Descrição              |
|--------|------------------|------|------------------------|
| POST   | /api/auth/register | —  | Registrar usuário      |
| POST   | /api/auth/login    | —  | Login + JWT            |
| GET    | /api/auth/me       | ✅  | Perfil do usuário      |
| PATCH  | /api/auth/me       | ✅  | Atualizar perfil       |

### Events
| Método | Rota                          | Auth       | Descrição              |
|--------|-------------------------------|------------|------------------------|
| GET    | /api/events                   | —          | Listar (com filtros)   |
| GET    | /api/events/:id               | —          | Detalhes do evento     |
| POST   | /api/events                   | organizador| Criar evento           |
| PATCH  | /api/events/:id               | organizador| Editar evento          |
| DELETE | /api/events/:id               | organizador| Cancelar evento        |
| GET    | /api/events/organizer/mine    | organizador| Meus eventos           |
| GET    | /api/events/organizer/:id/stats| organizador| Métricas do evento    |

### Orders
| Método | Rota                        | Auth | Descrição              |
|--------|-----------------------------|------|------------------------|
| POST   | /api/orders                 | ✅   | Criar pedido           |
| GET    | /api/orders                 | ✅   | Meus pedidos           |
| GET    | /api/orders/:id             | ✅   | Detalhes do pedido     |
| GET    | /api/orders/organizer/sales | org  | Vendas do organizador  |

### Payments
| Método | Rota                           | Auth | Descrição              |
|--------|--------------------------------|------|------------------------|
| POST   | /api/payments/create-intent    | ✅   | Stripe PaymentIntent   |
| POST   | /api/payments/pix              | ✅   | Gerar código Pix       |
| POST   | /api/payments/webhook          | —    | Webhook Stripe         |
| POST   | /api/payments/confirm-pix/:id  | ✅   | Confirmar Pix (dev)    |

---

## Integração com o Frontend React

### 1. Copiar `api.js` para o projeto frontend

```bash
cp src/services/api.js ../gooes-frontend/src/services/api.js
```

### 2. Criar `.env` no frontend

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Substituir o AuthContext

Copie `src/contexts/AuthContext.jsx` para o frontend. Ele já usa a API real.

### 4. Atualizar as páginas

Exemplo — substituir eventos mockados na Home:

```jsx
// ANTES (mock)
import events from '../data/events';

// DEPOIS (API)
import { eventsApi } from '../services/api';

const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  eventsApi.getAll({ limit: 12 }).then(({ data }) => {
    setEvents(data);
    setLoading(false);
  });
}, []);
```

### 5. Integrar Stripe no Checkout

```bash
# Frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```jsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentsApi, ordersApi } from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
    });
    if (error) console.error(error.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe}>Pagar</button>
    </form>
  );
}

// Na página de Checkout:
async function initCheckout() {
  // 1. Criar pedido
  const { data: order } = await ordersApi.create(cartItems, 'credit_card');
  // 2. Criar intent no Stripe
  const { clientSecret } = await paymentsApi.createIntent(order._id);
  // 3. Renderizar Elements com o clientSecret
  return { order, clientSecret };
}
```

---

## Webhook Stripe (desenvolvimento)

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Fazer login
stripe login

# Escutar eventos locais
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## Deploy em produção

### Backend — Railway (recomendado)

1. Criar projeto no [Railway](https://railway.app)
2. Conectar repositório GitHub
3. Adicionar variável `MONGODB_URI` (MongoDB Atlas)
4. Adicionar demais variáveis do `.env`
5. Deploy automático a cada push

### Frontend — Vercel

1. Importar projeto no [Vercel](https://vercel.com)
2. Definir `VITE_API_URL` com a URL do Railway
3. Definir `VITE_STRIPE_PUBLIC_KEY` com sua pk_live_...

---

## Segurança checklist

- [x] Senhas com bcrypt (salt 12)
- [x] JWT com expiração
- [x] Helmet (headers HTTP seguros)
- [x] CORS restrito ao domínio do frontend
- [x] Validação de entrada com express-validator
- [x] Senha não retorna em nenhuma query (`select: false`)
- [x] Roles verificados em cada rota protegida
- [x] Soft delete (eventos não são apagados do banco)
- [x] Webhook Stripe validado com assinatura criptográfica
- [ ] Rate limiting (adicionar `express-rate-limit`)
- [ ] Logs estruturados em produção (adicionar `winston`)
- [ ] Upload de imagens (adicionar `multer` + S3/Cloudinary)
