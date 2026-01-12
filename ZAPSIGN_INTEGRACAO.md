# Integração ZapSign - Documentação

## 📝 Visão Geral

Este projeto agora inclui integração completa com a API ZapSign para assinatura digital de contratos. A integração está configurada para o **ambiente Sandbox** (testes).

## 🔧 Configuração Inicial

### 1. Obter Token da API

1. Acesse [ZapSign Dashboard](https://app.zapsign.com.br)
2. Faça login ou crie uma conta
3. Vá para **Configurações > API**
4. Copie seu **Token de API** (ambiente Sandbox)

### 2. Configurar no Sistema

1. Abra o sistema de contratos
2. Clique no botão **"Configurar ZapSign"** no cabeçalho
3. Cole o token da API
4. Clique em **"Testar Conexão"** para validar
5. Clique em **"Salvar"**

## 🚀 Como Usar

### Enviar Contrato para Assinatura

Existem duas formas de enviar contratos para assinatura:

#### Opção 1: Após preencher o formulário
1. Preencha o formulário de contrato normalmente
2. Na página de revisão (review.html), haverá um botão "Enviar para Assinatura ZapSign"
3. O sistema fará:
   - Upload do PDF gerado
   - Criação do documento na ZapSign
   - Adição automática dos signatários
   - Envio por email para assinatura

#### Opção 2: Para contratos já criados
1. Acesse o **Histórico de Contratos**
2. Localize o contrato desejado
3. Clique em **"Enviar para Assinatura"**
4. Confirme o envio

### Acompanhar Assinaturas

1. Clique em **"Assinaturas Pendentes"** no cabeçalho
2. Visualize todos os contratos aguardando assinatura
3. Clique em **"Atualizar"** para verificar o status atual
4. Status possíveis:
   - `pending`: Aguardando assinatura
   - `signed`: Assinado por todos
   - `cancelled`: Cancelado

## 🔌 API Endpoints Disponíveis

A integração oferece os seguintes recursos:

### Documentos
```javascript
// Criar documento
ZapSignAPI.createDocument(documentData)

// Listar documentos
ZapSignAPI.listDocuments(filters)

// Obter detalhes de documento
ZapSignAPI.getDocument(docToken)

// Deletar documento
ZapSignAPI.deleteDocument(docToken)
```

### Signatários
```javascript
// Adicionar signatários
ZapSignAPI.addSigners(docToken, signers)

// Enviar para assinatura
ZapSignAPI.sendDocument(docToken)
```

### Upload
```javascript
// Upload de PDF
ZapSignAPI.uploadPDF(file)
```

## 📋 Estrutura de Signatários

Os signatários são preparados automaticamente com base nos dados do contrato:

```javascript
{
  name: "Nome do Signatário",
  email: "email@exemplo.com",
  phone: "11999999999", // Apenas números
  auth_mode: "email", // ou "sms", "whatsapp"
  sign_as: "sign" // ou "approval"
}
```

### Modos de Autenticação
- **email**: Assinatura via link por email
- **sms**: Código enviado por SMS
- **whatsapp**: Código via WhatsApp

### Tipos de Assinatura
- **sign**: Assinatura completa
- **approval**: Apenas aprovação (sem assinatura)

## 💾 Armazenamento Local

O sistema salva as seguintes informações localmente:

```javascript
// Token da API
localStorage.setItem('zapsignApiToken', token)

// Referências de assinatura
localStorage.setItem('contractSignatures', JSON.stringify({
  "CEF 183-2025": {
    zapSignToken: "abc123...",
    zapSignId: "doc_123",
    status: "pending",
    createdAt: "2025-01-11T...",
    lastChecked: "2025-01-11T..."
  }
}))
```

## 🔒 Segurança

⚠️ **Importante:**
- O token da API é armazenado no `localStorage` do navegador
- Em produção, considere implementar um backend para gerenciar o token
- Nunca compartilhe seu token publicamente
- Use HTTPS em produção

## 🧪 Ambiente Sandbox

O sistema está configurado para o ambiente de testes:

```javascript
const ZapSignConfig = {
    apiUrl: 'https://sandbox.api.zapsign.com.br/api/v1',
    sandboxMode: true
};
```

### Características do Sandbox:
- ✅ Testes ilimitados sem custo
- ✅ Mesma API do ambiente de produção
- ✅ Documentos marcados como "Sandbox"
- ❌ Emails de teste (não enviam notificações reais por padrão)

### Migrar para Produção:

Para usar em produção, altere em `zapsign-integration.js`:

```javascript
const ZapSignConfig = {
    apiUrl: 'https://api.zapsign.com.br/api/v1',
    sandboxMode: false
};
```

## 📊 Fluxo Completo

```
1. Usuário preenche formulário
   ↓
2. Sistema gera PDF do contrato
   ↓
3. Sistema faz upload do PDF para ZapSign
   ↓
4. Sistema cria documento na ZapSign
   ↓
5. Sistema adiciona signatários
   ↓
6. Sistema envia para assinatura
   ↓
7. Signatários recebem email
   ↓
8. Signatários assinam digitalmente
   ↓
9. Sistema pode consultar status
   ↓
10. Documento assinado disponível na ZapSign
```

## 🛠️ Tratamento de Erros

O sistema possui tratamento completo de erros:

```javascript
try {
    await ContractSignatureManager.sendContractForSignature(data, pdf);
} catch (error) {
    // Erro capturado e exibido ao usuário
    console.error('Erro:', error.message);
}
```

### Erros Comuns:

1. **Token não configurado**
   - Solução: Configure o token em "Configurar ZapSign"

2. **Token inválido**
   - Solução: Verifique se copiou o token corretamente

3. **Erro de upload**
   - Solução: Verifique o tamanho e formato do PDF

4. **Email inválido**
   - Solução: Verifique os emails dos signatários

## 📖 Recursos Adicionais

- [Documentação Oficial ZapSign](https://docs.zapsign.com.br)
- [Dashboard ZapSign](https://app.zapsign.com.br)
- [Suporte ZapSign](https://zapsign.com.br/contato)

## 🔄 Atualizações Futuras

Funcionalidades planejadas:
- [ ] Webhook para receber notificações de assinatura
- [ ] Download automático de documentos assinados
- [ ] Lembretes automáticos para signatários
- [ ] Relatório de assinaturas
- [ ] Assinatura em lote
- [ ] Templates de documentos

## 📝 Exemplo de Uso Completo

```javascript
// 1. Configurar API
ZapSignAPI.setApiToken('seu_token_aqui');

// 2. Preparar dados do contrato
const contractData = {
    contractNumber: 'CEF 183-2025',
    legalRepName: 'João Silva',
    email: 'joao@exemplo.com',
    phone: '11999999999'
};

// 3. Gerar PDF (usando jsPDF)
const pdfBlob = generatePDF(contractData);

// 4. Enviar para assinatura
const result = await ContractSignatureManager.sendContractForSignature(
    contractData, 
    pdfBlob
);

console.log('Documento criado:', result.token);

// 5. Verificar status posteriormente
const status = await ContractSignatureManager.checkSignatureStatus('CEF 183-2025');
console.log('Status:', status.status);
```

## ❓ Perguntas Frequentes

**Q: Posso usar em produção?**
A: Sim, basta alterar as configurações e usar um token de produção.

**Q: Quantos signatários posso adicionar?**
A: Depende do seu plano ZapSign. No sandbox, geralmente sem limite.

**Q: Os emails são enviados automaticamente?**
A: Sim, após chamar `sendDocument()`, a ZapSign envia os emails.

**Q: Posso personalizar o email?**
A: Sim, através do dashboard ZapSign ou API avançada.

**Q: Como sei quando o contrato foi assinado?**
A: Use `checkSignatureStatus()` ou configure webhooks.

## 📞 Suporte

Para problemas com a integração:
1. Verifique o console do navegador (F12)
2. Teste a conexão com a API
3. Consulte a documentação oficial
4. Entre em contato com o suporte ZapSign

---

**Última atualização:** 11 de janeiro de 2026
**Versão do Sistema:** 2.0 com ZapSign
