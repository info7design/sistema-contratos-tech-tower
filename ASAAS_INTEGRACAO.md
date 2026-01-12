# Integração Asaas - Documentação Completa

## 📝 Visão Geral

Integração completa com a API Asaas para gerenciamento de pagamentos e cobranças dos contratos. O sistema utiliza o **ambiente Sandbox** para testes.

## 🔧 Configuração Inicial

### 1. Obter API Key do Asaas

1. Acesse [Asaas](https://www.asaas.com)
2. Faça login na sua conta
3. Vá em **Configurações > Integrações > API**
4. Copie a **API Key** do ambiente **Sandbox**

### 2. Configurar no Sistema

1. Abra `index.html`
2. Clique no botão **"💵 Configurar Asaas"** (azul claro)
3. Cole sua API Key
4. Clique em **"Testar Conexão"**
5. Se OK, clique em **"Salvar"**

## 🚀 Funcionalidades

### ✅ Cadastro Automático de Clientes

O sistema coleta automaticamente do formulário:

- **Nome/Razão Social**: `companyName` ou `legalRepName`
- **CPF/CNPJ**: `companyDocument` ou `legalRepDocument`
- **Email**: `email` ou `companyEmail`
- **Telefone**: `phone` ou `companyPhone`
- **Endereço**: `companyAddress` (com extração automática de rua, número, bairro e CEP)

### 💰 Geração de Cobranças

- Cria cobrança mensal automaticamente
- Valor extraído do campo `monthlyContractValue`
- Vencimento: dia 10 do próximo mês
- Tipo: Boleto bancário (configurável)
- Referência: Número do contrato

### 📊 Acompanhamento

- Lista de pagamentos pendentes
- Atualização de status em tempo real
- Links diretos para boletos
- Histórico de cobranças

## 📋 Como Usar

### Na Página de Revisão (review.html)

Após preencher o contrato:

1. Clique em **"💵 Gerar Cobrança"**
2. Sistema cria automaticamente:
   - Cliente no Asaas (se não existir)
   - Cobrança mensal
3. Recebe link do boleto
4. Referência salva localmente

### Verificar Pagamentos Pendentes

1. No `index.html`, clique em **"💳 Pagamentos Pendentes"**
2. Veja lista de todos os pagamentos
3. Clique em **"Atualizar"** para verificar status
4. Acesse boleto diretamente

## 🔌 API Endpoints Utilizados

### Clientes

```javascript
// Criar cliente
POST /customers
{
  "name": "Nome do Cliente",
  "cpfCnpj": "12345678900",
  "email": "cliente@email.com",
  "phone": "11999999999",
  "mobilePhone": "11999999999",
  "address": "Rua Exemplo",
  "addressNumber": "123",
  "province": "Bairro",
  "postalCode": "12345678"
}

// Buscar cliente por CPF/CNPJ
GET /customers?cpfCnpj=12345678900

// Listar clientes
GET /customers?limit=10
```

### Cobranças

```javascript
// Criar cobrança
POST /payments
{
  "customer": "cus_000000000000",
  "billingType": "BOLETO",
  "value": 1500.00,
  "dueDate": "2026-02-10",
  "description": "Mensalidade - Contrato CEF 183-2025",
  "externalReference": "CEF 183-2025"
}

// Buscar cobrança
GET /payments/{id}

// Listar cobranças
GET /payments?customer=cus_000000000000
```

## 💾 Armazenamento Local

### Estrutura de Dados

```javascript
// localStorage: 'asaasApiKey'
"sua_api_key_aqui"

// localStorage: 'contractPayments'
{
  "CEF 183-2025": {
    "customerId": "cus_000000000000",
    "paymentId": "pay_000000000000",
    "status": "PENDING",
    "value": 1500.00,
    "dueDate": "2026-02-10",
    "invoiceUrl": "https://...",
    "bankSlipUrl": "https://...",
    "createdAt": "2026-01-11T...",
    "lastChecked": "2026-01-11T..."
  }
}
```

## 📖 Exemplos de Código

### Criar Cliente e Cobrança

```javascript
// Dados do contrato
const contractData = {
    contractNumber: 'CEF 183-2025',
    companyName: 'Empresa Exemplo LTDA',
    companyDocument: '12.345.678/0001-90',
    companyEmail: 'contato@empresa.com',
    companyPhone: '(12) 98765-4321',
    companyAddress: 'Av. Exemplo, 123 - Centro - CEP 12345-678',
    monthlyContractValue: 'R$ 1.500,00'
};

// Criar pagamento
const result = await ContractPaymentManager.createContractPayment(contractData);

console.log('Cliente:', result.customer.id);
console.log('Cobrança:', result.payment.id);
console.log('Boleto:', result.payment.bankSlipUrl);
```

### Verificar Status de Pagamento

```javascript
const contractNumber = 'CEF 183-2025';
const payment = await ContractPaymentManager.checkPaymentStatus(contractNumber);

console.log('Status:', payment.status);
// PENDING, RECEIVED, CONFIRMED, OVERDUE, etc.
```

### Listar Pagamentos Pendentes

```javascript
const pending = ContractPaymentManager.getPendingPayments();

pending.forEach(payment => {
    console.log(`Contrato: ${payment.contractNumber}`);
    console.log(`Valor: R$ ${payment.value}`);
    console.log(`Vencimento: ${payment.dueDate}`);
});
```

## 🎯 Status de Cobranças

| Status | Descrição |
|--------|-----------|
| `PENDING` | Aguardando pagamento |
| `RECEIVED` | Pagamento identificado |
| `CONFIRMED` | Pagamento confirmado |
| `OVERDUE` | Vencido |
| `REFUNDED` | Estornado |
| `RECEIVED_IN_CASH` | Recebido em dinheiro |
| `REFUND_REQUESTED` | Estorno solicitado |
| `CHARGEBACK_REQUESTED` | Chargeback solicitado |
| `CHARGEBACK_DISPUTE` | Em disputa de chargeback |
| `AWAITING_CHARGEBACK_REVERSAL` | Aguardando reversão |

## 🔄 Extração Automática de Dados

### Endereço

O sistema extrai automaticamente:

```javascript
// Entrada: "Av. Dr. Nelson D'Ávila, 389 - Centro - CEP 12245-641"

// Saída:
{
    address: "Av. Dr. Nelson D'Ávila",
    addressNumber: "389",
    province: "Centro",
    postalCode: "12245641"
}
```

### Valor

```javascript
// Entrada: "R$ 1.500,00"
// Saída: 1500.00

// Entrada: "R$ 2.350,50"
// Saída: 2350.50
```

### CPF/CNPJ

```javascript
// Remove formatação automaticamente
// Entrada: "12.345.678/0001-90"
// Saída: "12345678000190"
```

## 🚨 Tratamento de Erros

### Erros Comuns

#### 1. API Key Inválida
```
Erro: API Key do Asaas não configurada
Solução: Configure a API Key em "Configurar Asaas"
```

#### 2. Cliente Duplicado
```
O sistema busca automaticamente por CPF/CNPJ antes de criar
```

#### 3. Valor Inválido
```
Erro: Valor deve ser maior que zero
Solução: Verifique o campo "monthlyContractValue"
```

#### 4. Data de Vencimento Inválida
```
Sistema gera automaticamente: dia 10 do próximo mês
```

## 🔒 Segurança

### Ambiente Sandbox

⚠️ **O sistema está configurado para SANDBOX:**

```javascript
const AsaasConfig = {
    apiUrl: 'https://sandbox.asaas.com/api/v3',
    sandboxMode: true
};
```

### Migrar para Produção

Para usar em produção, altere em `asaas-integration.js`:

```javascript
const AsaasConfig = {
    apiUrl: 'https://www.asaas.com/api/v3',
    sandboxMode: false
};
```

E use a **API Key de produção**.

## 📊 Fluxo Completo

```
1. Usuário preenche contrato
   ↓
2. Sistema coleta dados do cliente
   ↓
3. Busca cliente por CPF/CNPJ no Asaas
   ↓
4. Se não existir, cria novo cliente
   ↓
5. Prepara dados da cobrança
   ↓
6. Cria cobrança no Asaas
   ↓
7. Salva referência localmente
   ↓
8. Exibe link do boleto
   ↓
9. Cliente recebe email com boleto
   ↓
10. Acompanhamento do pagamento
```

## 🛠️ Personalização

### Alterar Tipo de Cobrança

Em `asaas-integration.js`, método `preparePaymentData`:

```javascript
billingType: 'BOLETO', // Alterar para: PIX, CREDIT_CARD, UNDEFINED
```

### Alterar Dia de Vencimento

```javascript
dueDate.setDate(10); // Alterar dia aqui (1-31)
```

### Adicionar Split de Pagamento

```javascript
split: [
    {
        walletId: "wallet_id_aqui",
        fixedValue: 100.00,
        percentualValue: 10
    }
]
```

## 📞 Recursos Adicionais

- [Documentação Oficial Asaas](https://docs.asaas.com)
- [Dashboard Asaas](https://www.asaas.com)
- [Suporte Asaas](https://www.asaas.com/suporte)

## ❓ FAQ

**Q: Posso usar cartão de crédito?**
A: Sim, altere `billingType` para `CREDIT_CARD`

**Q: Como receber via PIX?**
A: Altere `billingType` para `PIX`

**Q: Posso gerar cobrança recorrente?**
A: Sim, use o endpoint `/subscriptions`

**Q: Como cancelar uma cobrança?**
A: Use `AsaasAPI.deletePayment(paymentId)`

**Q: Os emails são automáticos?**
A: Sim, o Asaas envia automaticamente após criar cobrança

---

**Última atualização:** 11 de janeiro de 2026  
**Versão:** 2.0 com Asaas Integration
