# ⚡ Quick Start - ZapSign Integration

## Configuração Rápida (5 minutos)

### 1️⃣ Obter Token da API

1. Acesse: https://app.zapsign.com.br/
2. Faça login ou crie uma conta gratuita
3. Vá em **Configurações** → **API**
4. Copie o **Token de API** (ambiente Sandbox)

**Token de teste para demonstração:**
```
bc659448-0e4c-4432-a09f-a41aa5d211bf8bd1ca94-ac6a-4587-9525-1e7c3af611b6
```
⚠️ *Este é apenas um exemplo. Use seu token real da ZapSign.*

### 2️⃣ Configurar no Sistema

1. Abra o arquivo `index.html` no navegador
2. Clique no botão **"Configurar ZapSign"** (amarelo)
3. Cole seu token da API
4. Clique em **"Testar Conexão"**
5. Se ok, clique em **"Salvar"**

### 3️⃣ Usar a Integração

**Opção A - Novo Contrato:**
1. Preencha o formulário normalmente
2. Na página de revisão, clique em **"Enviar para ZapSign"**
3. Os signatários receberão email para assinar

**Opção B - Contrato Existente:**
1. Clique em **"Histórico"** no cabeçalho
2. Selecione o contrato
3. Clique em **"Enviar para Assinatura"**

## 🎯 Exemplo de Uso

```javascript
// 1. Configurar token (feito pela interface)
ZapSignAPI.setApiToken('seu_token_aqui');

// 2. Sistema faz automaticamente ao enviar:
// - Upload do PDF
// - Criação do documento
// - Adição de signatários
// - Envio de emails
```

## 🔐 Segurança e Ambiente de Testes

⚠️ **Importante**: O sistema está configurado para o **ambiente Sandbox** da ZapSign:
- URL: `https://sandbox.api.zapsign.com.br/api/v1/`
- Ideal para testes sem custo
- Documentos marcados como "Sandbox"
- Para produção, altere as configurações em `zapsign-integration.js`

## 🔄 Acompanhar Assinaturas

1. Clique em **"Assinaturas Pendentes"** (verde)
2. Visualize todos os contratos
3. Clique em **"Atualizar"** para verificar status
4. Status possíveis:
   - ⏳ `pending`: Aguardando assinatura
   - ✅ `signed`: Assinado por todos
   - ❌ `cancelled`: Cancelado

## 📋 Checklist de Configuração

- [ ] Conta criada na ZapSign
- [ ] Token de API copiado
- [ ] Token configurado no sistema
- [ ] Conexão testada e funcionando
- [ ] Contrato de teste enviado
- [ ] Email de assinatura recebido

## 🆘 Problemas Comuns

### "Token não configurado"
**Solução:** Clique em "Configurar ZapSign" e insira o token

### "Erro na conexão"
**Solução:** Verifique se:
- Token está correto (sem espaços)
- Está usando o token do ambiente Sandbox
- Tem conexão com a internet

### "Erro ao fazer upload"
**Solução:** 
- Verifique se o PDF foi gerado corretamente
- Tamanho do arquivo deve ser < 10MB

## 📚 Documentação Adicional

- **[ZAPSIGN_INTEGRACAO.md](ZAPSIGN_INTEGRACAO.md)**: Documentação completa da integração
- **[README.md](README.md)**: Documentação geral do sistema
- [Documentação Oficial ZapSign](https://docs.zapsign.com.br)

## 💡 Dicas

1. **Sempre teste no Sandbox primeiro** antes de usar em produção
2. **Guarde seu token com segurança** - ele dá acesso à sua conta
3. **Verifique os emails** dos signatários antes de enviar
4. **Use nomes completos** para melhor identificação

---

**Pronto para começar!** 🚀

Qualquer dúvida, consulte a documentação completa ou o suporte da ZapSign.
