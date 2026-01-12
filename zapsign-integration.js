/**
 * Módulo de Integração com ZapSign
 * API de Assinatura Digital - Ambiente Sandbox
 * https://sandbox.api.zapsign.com.br/api/v1/
 */

const ZapSignConfig = {
    apiUrl: 'https://sandbox.api.zapsign.com.br/api/v1',
    apiToken: '', // Será configurado pelo usuário
    sandboxMode: true
};

const ZapSignAPI = {
    /**
     * Configura o token da API
     * @param {string} token - Token de autenticação da API ZapSign
     */
    setApiToken(token) {
        ZapSignConfig.apiToken = token;
        localStorage.setItem('zapsignApiToken', token);
    },

    /**
     * Recupera o token salvo
     * @returns {string} Token da API
     */
    getApiToken() {
        if (!ZapSignConfig.apiToken) {
            ZapSignConfig.apiToken = localStorage.getItem('zapsignApiToken') || '';
        }
        return ZapSignConfig.apiToken;
    },

    /**
     * Faz uma requisição para a API ZapSign
     * @param {string} endpoint - Endpoint da API
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
     * @param {Object} data - Dados para enviar
     * @returns {Promise} Resposta da API
     */
    async request(endpoint, method = 'GET', data = null) {
        const token = this.getApiToken();
        
        if (!token) {
            throw new Error('Token da API ZapSign não configurado. Configure em Configurações > ZapSign API.');
        }

        const url = `${ZapSignConfig.apiUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || `Erro na API: ${response.status}`);
            }

            return responseData;
        } catch (error) {
            console.error('Erro na requisição ZapSign:', error);
            throw error;
        }
    },

    /**
     * Cria um novo documento para assinatura
     * @param {Object} documentData - Dados do documento
     * @returns {Promise} Documento criado
     */
    async createDocument(documentData) {
        return await this.request('/docs/', 'POST', documentData);
    },

    /**
     * Lista documentos
     * @param {Object} filters - Filtros de busca
     * @returns {Promise} Lista de documentos
     */
    async listDocuments(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = queryString ? `/docs/?${queryString}` : '/docs/';
        return await this.request(endpoint, 'GET');
    },

    /**
     * Obtém detalhes de um documento
     * @param {string} docToken - Token do documento
     * @returns {Promise} Detalhes do documento
     */
    async getDocument(docToken) {
        return await this.request(`/docs/${docToken}/`, 'GET');
    },

    /**
     * Adiciona signatários ao documento
     * @param {string} docToken - Token do documento
     * @param {Array} signers - Lista de signatários
     * @returns {Promise} Documento atualizado
     */
    async addSigners(docToken, signers) {
        return await this.request(`/docs/${docToken}/add-signers/`, 'POST', { signers });
    },

    /**
     * Envia o documento para assinatura
     * @param {string} docToken - Token do documento
     * @returns {Promise} Documento enviado
     */
    async sendDocument(docToken) {
        return await this.request(`/docs/${docToken}/send/`, 'POST');
    },

    /**
     * Deleta um documento
     * @param {string} docToken - Token do documento
     * @returns {Promise} Confirmação de exclusão
     */
    async deleteDocument(docToken) {
        return await this.request(`/docs/${docToken}/`, 'DELETE');
    },

    /**
     * Faz upload de um arquivo PDF
     * @param {File} file - Arquivo PDF
     * @returns {Promise} URL do arquivo uploadado
     */
    async uploadPDF(file) {
        const token = this.getApiToken();
        
        if (!token) {
            throw new Error('Token da API ZapSign não configurado.');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${ZapSignConfig.apiUrl}/docs/upload/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro ao fazer upload do PDF');
        }

        return data;
    }
};

/**
 * Gerenciador de Assinatura de Contratos
 */
const ContractSignatureManager = {
    /**
     * Cria um contrato para assinatura na ZapSign
     * @param {Object} contractData - Dados do contrato
     * @param {File} pdfFile - Arquivo PDF do contrato
     * @returns {Promise} Documento criado na ZapSign
     */
    async sendContractForSignature(contractData, pdfFile) {
        try {
            // 1. Upload do PDF
            UIManager.showLoading('Fazendo upload do contrato...');
            const uploadResult = await ZapSignAPI.uploadPDF(pdfFile);

            // 2. Criar documento na ZapSign
            UIManager.showLoading('Criando documento para assinatura...');
            const documentData = {
                name: `Contrato ${contractData.contractNumber}`,
                url_pdf: uploadResult.url,
                sandbox: ZapSignConfig.sandboxMode
            };

            const document = await ZapSignAPI.createDocument(documentData);

            // 3. Adicionar signatários
            UIManager.showLoading('Adicionando signatários...');
            const signers = this.prepareSigners(contractData);
            await ZapSignAPI.addSigners(document.token, signers);

            // 4. Enviar para assinatura
            UIManager.showLoading('Enviando para assinatura...');
            await ZapSignAPI.sendDocument(document.token);

            // 5. Salvar referência no banco de dados local
            this.saveSignatureReference(contractData.contractNumber, document);

            UIManager.hideLoading();
            return document;
        } catch (error) {
            UIManager.hideLoading();
            throw error;
        }
    },

    /**
     * Prepara os signatários do contrato
     * @param {Object} contractData - Dados do contrato
     * @returns {Array} Lista de signatários
     */
    prepareSigners(contractData) {
        const signers = [];

        // Signatário 1: Representante Legal
        signers.push({
            name: contractData.legalRepName,
            email: contractData.email,
            phone: contractData.phone?.replace(/\D/g, ''),
            auth_mode: 'email', // ou 'sms', 'whatsapp'
            sign_as: 'sign' // 'sign' ou 'approval'
        });

        // Signatário 2: Tech Tower Coworking (se necessário)
        // Pode ser configurado para adicionar automaticamente a empresa

        return signers;
    },

    /**
     * Salva referência da assinatura no banco de dados
     * @param {string} contractNumber - Número do contrato
     * @param {Object} zapSignDocument - Documento da ZapSign
     */
    saveSignatureReference(contractNumber, zapSignDocument) {
        const signatures = this.getAllSignatures();
        signatures[contractNumber] = {
            zapSignToken: zapSignDocument.token,
            zapSignId: zapSignDocument.id,
            status: zapSignDocument.status,
            createdAt: new Date().toISOString(),
            lastChecked: new Date().toISOString()
        };
        localStorage.setItem('contractSignatures', JSON.stringify(signatures));
    },

    /**
     * Recupera todas as referências de assinatura
     * @returns {Object} Assinaturas salvas
     */
    getAllSignatures() {
        try {
            const data = localStorage.getItem('contractSignatures');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Erro ao carregar assinaturas:', error);
            return {};
        }
    },

    /**
     * Verifica o status de assinatura de um contrato
     * @param {string} contractNumber - Número do contrato
     * @returns {Promise} Status atualizado
     */
    async checkSignatureStatus(contractNumber) {
        const signatures = this.getAllSignatures();
        const signatureRef = signatures[contractNumber];

        if (!signatureRef) {
            throw new Error('Contrato não encontrado no sistema de assinaturas');
        }

        try {
            const document = await ZapSignAPI.getDocument(signatureRef.zapSignToken);
            
            // Atualizar status local
            signatureRef.status = document.status;
            signatureRef.lastChecked = new Date().toISOString();
            signatures[contractNumber] = signatureRef;
            localStorage.setItem('contractSignatures', JSON.stringify(signatures));

            return document;
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    },

    /**
     * Lista todos os contratos pendentes de assinatura
     * @returns {Array} Contratos pendentes
     */
    getPendingSignatures() {
        const signatures = this.getAllSignatures();
        return Object.entries(signatures)
            .filter(([_, sig]) => sig.status !== 'signed')
            .map(([contractNumber, sig]) => ({
                contractNumber,
                ...sig
            }));
    }
};

/**
 * Interface de Configuração da API
 */
function showZapSignConfig() {
    const currentToken = ZapSignAPI.getApiToken();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Configuração ZapSign API</h5>
                    <button type="button" class="close" onclick="closeZapSignConfig()">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <strong>Ambiente Sandbox</strong><br>
                        Você está usando o ambiente de testes da ZapSign.<br>
                        URL: <code>https://sandbox.api.zapsign.com.br/api/v1/</code>
                    </div>
                    <div class="form-group">
                        <label for="zapsignToken">Token da API:</label>
                        <input type="password" 
                               class="form-control" 
                               id="zapsignToken" 
                               value="${currentToken}"
                               placeholder="Cole seu token da API ZapSign">
                        <small class="form-text text-muted">
                            Obtenha seu token em: 
                            <a href="https://app.zapsign.com.br/configuracoes/api" target="_blank">
                                ZapSign Dashboard > Configurações > API
                            </a>
                        </small>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary btn-block" onclick="testZapSignConnection()">
                            <i class="fas fa-check-circle"></i> Testar Conexão
                        </button>
                    </div>
                    <div id="connectionTestResult"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeZapSignConfig()">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveZapSignToken()">
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'zapsignBackdrop';
    document.body.appendChild(backdrop);
}

function closeZapSignConfig() {
    const modal = document.querySelector('.modal');
    const backdrop = document.getElementById('zapsignBackdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
}

function saveZapSignToken() {
    const tokenInput = document.getElementById('zapsignToken');
    const token = tokenInput.value.trim();
    
    if (!token) {
        alert('Por favor, insira o token da API.');
        return;
    }
    
    ZapSignAPI.setApiToken(token);
    alert('Token salvo com sucesso!');
    closeZapSignConfig();
}

async function testZapSignConnection() {
    const resultDiv = document.getElementById('connectionTestResult');
    const tokenInput = document.getElementById('zapsignToken');
    const token = tokenInput.value.trim();
    
    if (!token) {
        resultDiv.innerHTML = `
            <div class="alert alert-warning">
                Por favor, insira o token antes de testar.
            </div>
        `;
        return;
    }
    
    // Salvar temporariamente para testar
    const oldToken = ZapSignAPI.getApiToken();
    ZapSignAPI.setApiToken(token);
    
    resultDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> Testando conexão...
        </div>
    `;
    
    try {
        await ZapSignAPI.listDocuments({ limit: 1 });
        resultDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> Conexão bem-sucedida!
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times-circle"></i> Erro na conexão: ${error.message}
            </div>
        `;
        // Restaurar token antigo
        ZapSignAPI.setApiToken(oldToken);
    }
}

/**
 * Mostra painel de assinaturas pendentes
 */
function showPendingSignatures() {
    const pending = ContractSignatureManager.getPendingSignatures();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Assinaturas Pendentes</h5>
                    <button type="button" class="close" onclick="closePendingSignaturesModal()">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${pending.length === 0 ? `
                        <div class="alert alert-info">
                            Nenhuma assinatura pendente.
                        </div>
                    ` : `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Contrato</th>
                                    <th>Status</th>
                                    <th>Criado em</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pending.map(sig => `
                                    <tr>
                                        <td>${sig.contractNumber}</td>
                                        <td>
                                            <span class="badge badge-warning">${sig.status}</span>
                                        </td>
                                        <td>${new Date(sig.createdAt).toLocaleString('pt-BR')}</td>
                                        <td>
                                            <button class="btn btn-sm btn-info" 
                                                    onclick="checkSignatureStatusUI('${sig.contractNumber}')">
                                                <i class="fas fa-sync"></i> Atualizar
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closePendingSignaturesModal()">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'pendingSignaturesBackdrop';
    document.body.appendChild(backdrop);
}

function closePendingSignaturesModal() {
    const modal = document.querySelector('.modal');
    const backdrop = document.getElementById('pendingSignaturesBackdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
}

async function checkSignatureStatusUI(contractNumber) {
    try {
        const document = await ContractSignatureManager.checkSignatureStatus(contractNumber);
        alert(`Status atualizado: ${document.status}\nÚltima atualização: ${new Date().toLocaleString('pt-BR')}`);
        
        // Recarregar modal
        closePendingSignaturesModal();
        showPendingSignatures();
    } catch (error) {
        alert(`Erro ao atualizar status: ${error.message}`);
    }
}

// Exportar para uso global
window.ZapSignAPI = ZapSignAPI;
window.ContractSignatureManager = ContractSignatureManager;
window.showZapSignConfig = showZapSignConfig;
window.showPendingSignatures = showPendingSignatures;
