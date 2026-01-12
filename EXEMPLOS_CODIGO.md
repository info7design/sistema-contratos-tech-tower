# 💻 Exemplos de Código - ZapSign Integration

## Índice
- [Configuração Básica](#configuração-básica)
- [Upload de PDF](#upload-de-pdf)
- [Criar e Enviar Documento](#criar-e-enviar-documento)
- [Gerenciar Signatários](#gerenciar-signatários)
- [Verificar Status](#verificar-status)
- [Tratamento de Erros](#tratamento-de-erros)

---

## Configuração Básica

### Configurar Token
```javascript
// Salvar token
// Token de teste (exemplo):
// bc659448-0e4c-4432-a09f-a41aa5d211bf8bd1ca94-ac6a-4587-9525-1e7c3af611b6
ZapSignAPI.setApiToken('seu_token_aqui');

// Recuperar token
const token = ZapSignAPI.getApiToken();
console.log('Token:', token);

// Verificar se está configurado
if (!ZapSignAPI.getApiToken()) {
    console.error('Token não configurado');
}
```

### Verificar Conexão
```javascript
async function verificarConexao() {
    try {
        const result = await ZapSignAPI.listDocuments({ limit: 1 });
        console.log('✅ Conectado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        return false;
    }
}

verificarConexao();
```

---

## Upload de PDF

### Método 1: Upload de File
```javascript
// Do input file
const fileInput = document.getElementById('pdfFile');
const file = fileInput.files[0];

async function uploadPDF(file) {
    try {
        const result = await ZapSignAPI.uploadPDF(file);
        console.log('PDF URL:', result.url);
        return result.url;
    } catch (error) {
        console.error('Erro no upload:', error.message);
        throw error;
    }
}

uploadPDF(file);
```

### Método 2: Upload de Blob (gerado via jsPDF)
```javascript
// Gerar PDF com jsPDF
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.text('Contrato de Teste', 10, 10);
const pdfBlob = doc.output('blob');

// Converter Blob para File
const pdfFile = new File([pdfBlob], 'contrato.pdf', {
    type: 'application/pdf'
});

// Upload
const pdfUrl = await ZapSignAPI.uploadPDF(pdfFile);
```

---

## Criar e Enviar Documento

### Fluxo Completo
```javascript
async function criarEEnviarContrato(contractData) {
    try {
        // 1. Gerar PDF
        const pdfBlob = gerarPDF(contractData);
        const pdfFile = new File([pdfBlob], `contrato_${contractData.numero}.pdf`, {
            type: 'application/pdf'
        });

        // 2. Upload
        const uploadResult = await ZapSignAPI.uploadPDF(pdfFile);
        
        // 3. Criar documento
        const documentData = {
            name: `Contrato ${contractData.numero}`,
            url_pdf: uploadResult.url,
            sandbox: true, // ou false para produção
            disable_signer_emails: false // enviar emails automaticamente
        };
        
        const document = await ZapSignAPI.createDocument(documentData);
        console.log('Documento criado:', document.token);
        
        // 4. Adicionar signatários
        const signers = [
            {
                name: contractData.clienteNome,
                email: contractData.clienteEmail,
                phone: contractData.clienteTelefone,
                auth_mode: 'email',
                sign_as: 'sign'
            },
            {
                name: 'Tech Tower Coworking',
                email: 'contatos@techtowercoworking.com.br',
                auth_mode: 'email',
                sign_as: 'sign'
            }
        ];
        
        await ZapSignAPI.addSigners(document.token, signers);
        console.log('Signatários adicionados');
        
        // 5. Enviar para assinatura
        await ZapSignAPI.sendDocument(document.token);
        console.log('Enviado para assinatura!');
        
        return document;
        
    } catch (error) {
        console.error('Erro no processo:', error.message);
        throw error;
    }
}

// Usar
const contratoData = {
    numero: 'CEF 183-2025',
    clienteNome: 'João Silva',
    clienteEmail: 'joao@exemplo.com',
    clienteTelefone: '11999999999'
};

criarEEnviarContrato(contratoData);
```

### Criar Documento Simples
```javascript
const documentData = {
    name: 'Meu Contrato',
    url_pdf: 'https://exemplo.com/contrato.pdf',
    sandbox: true
};

const doc = await ZapSignAPI.createDocument(documentData);
console.log('Token:', doc.token);
```

---

## Gerenciar Signatários

### Adicionar Único Signatário
```javascript
const signers = [
    {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '11999999999', // opcional
        auth_mode: 'email', // email, sms, whatsapp
        sign_as: 'sign' // sign ou approval
    }
];

await ZapSignAPI.addSigners(docToken, signers);
```

### Adicionar Múltiplos Signatários
```javascript
const signers = [
    {
        name: 'Cliente',
        email: 'cliente@exemplo.com',
        auth_mode: 'email',
        sign_as: 'sign'
    },
    {
        name: 'Empresa',
        email: 'empresa@exemplo.com',
        auth_mode: 'email',
        sign_as: 'sign'
    },
    {
        name: 'Testemunha',
        email: 'testemunha@exemplo.com',
        auth_mode: 'email',
        sign_as: 'approval' // apenas aprovação, sem assinatura
    }
];

await ZapSignAPI.addSigners(docToken, signers);
```

### Signatário com Autenticação SMS
```javascript
const signers = [
    {
        name: 'Cliente',
        email: 'cliente@exemplo.com',
        phone: '11999999999', // obrigatório para SMS
        auth_mode: 'sms', // enviar código por SMS
        sign_as: 'sign'
    }
];

await ZapSignAPI.addSigners(docToken, signers);
```

---

## Verificar Status

### Obter Detalhes de um Documento
```javascript
async function verificarDocumento(docToken) {
    try {
        const doc = await ZapSignAPI.getDocument(docToken);
        
        console.log('Nome:', doc.name);
        console.log('Status:', doc.status);
        console.log('Criado em:', doc.created_at);
        console.log('Signatários:', doc.signers);
        
        // Status possíveis:
        // - pending: aguardando assinatura
        // - signed: todos assinaram
        // - cancelled: cancelado
        
        return doc;
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

verificarDocumento('token_do_documento');
```

### Verificar Status de Contrato
```javascript
async function verificarStatusContrato(numeroContrato) {
    try {
        const doc = await ContractSignatureManager.checkSignatureStatus(numeroContrato);
        
        console.log(`Contrato: ${numeroContrato}`);
        console.log(`Status: ${doc.status}`);
        
        // Verificar se todos assinaram
        if (doc.status === 'signed') {
            console.log('✅ Todos assinaram!');
            // Baixar documento assinado
            console.log('Download:', doc.signed_file_url);
        }
        
        return doc;
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

verificarStatusContrato('CEF 183-2025');
```

### Listar Assinaturas Pendentes
```javascript
const pendentes = ContractSignatureManager.getPendingSignatures();

console.log(`Total pendentes: ${pendentes.length}`);

pendentes.forEach(sig => {
    console.log(`- ${sig.contractNumber}: ${sig.status}`);
});
```

---

## Tratamento de Erros

### Try-Catch Completo
```javascript
async function processarContrato(data) {
    try {
        // Validar dados
        if (!data.email) {
            throw new Error('Email é obrigatório');
        }
        
        // Processar
        const result = await ZapSignAPI.createDocument(data);
        
        // Sucesso
        console.log('✅ Sucesso:', result);
        return result;
        
    } catch (error) {
        // Tratar erro
        console.error('❌ Erro:', error.message);
        
        // Verificar tipo de erro
        if (error.message.includes('Token')) {
            alert('Configure o token da API primeiro');
        } else if (error.message.includes('404')) {
            alert('Documento não encontrado');
        } else {
            alert(`Erro: ${error.message}`);
        }
        
        return null;
    }
}
```

### Validações Antes de Enviar
```javascript
function validarAntesDe Enviar(contractData) {
    const erros = [];
    
    if (!contractData.email) {
        erros.push('Email é obrigatório');
    }
    
    if (!contractData.nome) {
        erros.push('Nome é obrigatório');
    }
    
    if (!ZapSignAPI.getApiToken()) {
        erros.push('Token da API não configurado');
    }
    
    if (erros.length > 0) {
        console.error('Erros de validação:', erros);
        alert('Erros encontrados:\n' + erros.join('\n'));
        return false;
    }
    
    return true;
}

// Usar
if (validarAntesDe Enviar(data)) {
    await criarEEnviarContrato(data);
}
```

---

## Exemplos Práticos

### Exemplo 1: Sistema de Onboarding
```javascript
// Quando cliente completa cadastro
async function finalizarOnboarding(clienteData) {
    // 1. Gerar contrato
    const pdfBlob = gerarContratoOnboarding(clienteData);
    const pdfFile = new File([pdfBlob], 'onboarding.pdf', {
        type: 'application/pdf'
    });
    
    // 2. Enviar para assinatura
    const result = await ContractSignatureManager.sendContractForSignature(
        clienteData,
        pdfFile
    );
    
    // 3. Salvar referência
    await salvarNoBancoDeDados({
        clienteId: clienteData.id,
        contratoId: result.token,
        status: 'aguardando_assinatura'
    });
    
    // 4. Notificar cliente
    enviarEmailNotificacao(clienteData.email, result.token);
}
```

### Exemplo 2: Verificação Periódica
```javascript
// Verificar status de todos os contratos pendentes a cada 5 minutos
setInterval(async () => {
    const pendentes = ContractSignatureManager.getPendingSignatures();
    
    for (const contrato of pendentes) {
        const doc = await ContractSignatureManager.checkSignatureStatus(
            contrato.contractNumber
        );
        
        if (doc.status === 'signed') {
            console.log(`✅ Contrato ${contrato.contractNumber} foi assinado!`);
            // Processar contrato assinado
            await processarContratoAssinado(contrato.contractNumber, doc);
        }
    }
}, 5 * 60 * 1000); // 5 minutos
```

### Exemplo 3: Interface de Usuário
```javascript
// Botão "Enviar para Assinatura"
document.getElementById('btnEnviarAssinatura').addEventListener('click', async () => {
    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Enviando...';
    
    try {
        const contractData = coletarDadosFormulario();
        const pdfBlob = await gerarPDF(contractData);
        const pdfFile = new File([pdfBlob], 'contrato.pdf', {
            type: 'application/pdf'
        });
        
        const result = await ContractSignatureManager.sendContractForSignature(
            contractData,
            pdfFile
        );
        
        alert(`✅ Enviado com sucesso!\n\nToken: ${result.token}`);
        
    } catch (error) {
        alert(`❌ Erro: ${error.message}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Enviar para Assinatura';
    }
});
```

---

## Dicas e Boas Práticas

### 1. Sempre validar antes de enviar
```javascript
if (!ZapSignAPI.getApiToken()) {
    alert('Configure a API primeiro');
    return;
}
```

### 2. Usar loading states
```javascript
mostrarLoading('Processando...');
try {
    await ZapSignAPI.sendDocument(token);
} finally {
    esconderLoading();
}
```

### 3. Salvar referências localmente
```javascript
ContractSignatureManager.saveSignatureReference(numeroContrato, document);
```

### 4. Verificar status periodicamente
```javascript
// Não verificar a cada segundo - respeitar rate limits
setInterval(verificarStatus, 5 * 60 * 1000); // 5 minutos
```

### 5. Tratar todos os erros
```javascript
try {
    // código
} catch (error) {
    console.error('Erro:', error);
    notificarUsuario(error.message);
    registrarLog(error);
}
```

---

## Referências

- **[Documentação Oficial ZapSign](https://docs.zapsign.com.br)**
- **[ZAPSIGN_INTEGRACAO.md](ZAPSIGN_INTEGRACAO.md)** - Documentação completa
- **[test-zapsign.html](test-zapsign.html)** - Página de testes

---

**Última atualização:** 11 de janeiro de 2026
