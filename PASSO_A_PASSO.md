# 🔍 Guia Passo a Passo - Como Testar a Integração ZapSign

## ⚠️ Problemas Comuns e Soluções

### 1. Arquivo não carrega ou não funciona
**Problema:** Ao abrir o arquivo HTML, nada acontece ou dá erro.

**Solução:**
```
✅ Certifique-se que está abrindo em um servidor web, não diretamente do explorador
✅ Use a extensão Live Server do VS Code
✅ Ou inicie um servidor local
```

## 📝 Como Testar PASSO A PASSO

### PASSO 1: Abrir o arquivo de teste corretamente

**Opção A - Usar Live Server (RECOMENDADO):**
1. Instale a extensão "Live Server" no VS Code
2. Clique com botão direito em `test-zapsign.html`
3. Selecione "Open with Live Server"
4. O navegador abrirá automaticamente

**Opção B - Usar servidor Python:**
```powershell
# No terminal, na pasta do projeto:
cd "d:\Visual Studio\Contrato"
python -m http.server 8000
# Depois abra: http://localhost:8000/test-zapsign.html
```

**Opção C - Usar servidor Node.js:**
```powershell
# Instalar http-server globalmente
npm install -g http-server

# Na pasta do projeto:
cd "d:\Visual Studio\Contrato"
http-server

# Abrir: http://localhost:8080/test-zapsign.html
```

### PASSO 2: Configurar o Token

1. **Obter token da ZapSign:**
   - Acesse: https://app.zapsign.com.br
   - Faça login ou crie uma conta
   - Vá em **Configurações** > **API**
   - Copie o token do ambiente **Sandbox**

2. **Cole o token de teste (fornecido):**
   ```
   b99b2e0d-31ed-430a-a59b-452e8c5c072a568da138-ec9e-4134-a53a-c0b20f63acfc
   ```

3. **Salvar e testar:**
   - Cole no campo "Token da API"
   - Clique em "Salvar Token"
   - Clique em "Testar Conexão"

### PASSO 3: Verificar Erros

**Abra o Console do Navegador:**
- **Chrome/Edge:** Pressione `F12` ou `Ctrl+Shift+J`
- **Firefox:** Pressione `F12` ou `Ctrl+Shift+K`

**O que procurar:**
```javascript
// ✅ Mensagens de sucesso:
"Token salvo com sucesso!"
"Conexão bem-sucedida!"

// ❌ Erros comuns:
"CORS error" → Use Live Server ou servidor local
"Token não configurado" → Configure o token primeiro
"404 Not Found" → Verifique se zapsign-integration.js existe
"401 Unauthorized" → Token inválido ou expirado
```

### PASSO 4: Testar Funcionalidades

**Teste 1 - Listar Documentos:**
```
1. Clique em "Listar Documentos"
2. Deve mostrar documentos existentes ou "Nenhum documento encontrado"
3. ✅ Se funcionar = API está conectada!
```

**Teste 2 - Criar Documento:**
```
1. Preencha:
   - Nome do Documento: "Teste - Meu Contrato"
   - Nome do Signatário: Seu nome
   - Email: Seu email real
2. Clique em "Criar Documento de Teste"
3. Aguarde o processo (pode levar 10-30 segundos)
4. ✅ Se funcionar = Você receberá um email!
```

**Teste 3 - Ver Status:**
```
1. Clique em "Verificar Status"
2. Deve mostrar:
   ✅ Script ZapSign: Carregado
   ✅ Token da API: Configurado
   📊 Contratos: 0 ou mais
   🌐 API URL: sandbox.api.zapsign.com.br
```

## 🚨 Erros Específicos e Soluções

### Erro: "Cannot read property of undefined"
**Causa:** Script zapsign-integration.js não carregou
**Solução:**
```html
<!-- Verifique se está no HTML: -->
<script src="zapsign-integration.js"></script>
```

### Erro: "CORS policy blocked"
**Causa:** Abrindo arquivo diretamente (file://)
**Solução:** Use Live Server ou servidor local

### Erro: "Failed to fetch"
**Causa:** Sem internet ou API fora do ar
**Solução:** Verifique conexão e tente novamente

### Erro: "401 Unauthorized"
**Causa:** Token inválido ou expirado
**Solução:** 
1. Obtenha novo token no dashboard ZapSign
2. Verifique se está usando token do Sandbox
3. Cole novamente e salve

### Erro: "Token não configurado"
**Causa:** Token não foi salvo
**Solução:**
1. Cole o token no campo
2. Clique em "Salvar Token"
3. Verifique se apareceu mensagem de sucesso

## ✅ Checklist de Verificação

Marque cada item conforme completar:

```
[ ] Arquivo test-zapsign.html aberto em servidor (não file://)
[ ] Console do navegador aberto (F12)
[ ] Token colado no campo
[ ] Clicou em "Salvar Token"
[ ] Apareceu mensagem "Token salvo com sucesso"
[ ] Clicou em "Testar Conexão"
[ ] Apareceu mensagem de sucesso ou erro específico
[ ] Sem erros no console (aba Console)
```

## 🔧 Teste Simplificado via Console

Cole este código no Console do navegador (F12):

```javascript
// Teste 1: Verificar se módulos estão carregados
console.log('ZapSignAPI:', typeof ZapSignAPI !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');
console.log('ContractSignatureManager:', typeof ContractSignatureManager !== 'undefined' ? '✅ Carregado' : '❌ Não carregado');

// Teste 2: Configurar token de teste
ZapSignAPI.setApiToken('b99b2e0d-31ed-430a-a59b-452e8c5c072a568da138-ec9e-4134-a53a-c0b20f63acfc');
console.log('Token configurado:', ZapSignAPI.getApiToken() ? '✅' : '❌');

// Teste 3: Testar conexão
ZapSignAPI.listDocuments({ limit: 1 })
  .then(result => console.log('✅ Conexão OK!', result))
  .catch(error => console.error('❌ Erro:', error.message));
```

## 📞 Se Nada Funcionar

**Envie estas informações:**
1. Print da tela do teste
2. Print do Console (F12) mostrando os erros
3. Qual navegador está usando (Chrome, Firefox, Edge, etc.)
4. Como está abrindo o arquivo (Live Server, Python, diretamente)
5. Mensagem de erro completa

## 🎯 Teste Mais Simples Possível

Se nada funcionar, teste o básico:

1. **Abra o Console (F12)**
2. **Digite:**
```javascript
fetch('https://sandbox.api.zapsign.com.br/api/v1/docs/', {
  headers: {
    'Authorization': 'Bearer b99b2e0d-31ed-430a-a59b-452e8c5c072a568da138-ec9e-4134-a53a-c0b20f63acfc'
  }
})
.then(r => r.json())
.then(data => console.log('✅ API funcionando!', data))
.catch(e => console.error('❌ Erro:', e));
```

3. **Se isso funcionar:** O problema é no código
4. **Se isso NÃO funcionar:** O problema é no token ou conexão

---

**Última atualização:** 11/01/2026  
**Suporte:** Consulte os arquivos de documentação ou reporte o erro específico
