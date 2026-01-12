/**
 * Módulo de Integração com Asaas
 * API de Pagamentos - Ambiente Sandbox
 * https://sandbox.asaas.com/api/v3/
 */

const AsaasConfig = {
    apiUrl: 'https://sandbox.asaas.com/api/v3',
    apiKey: '', // Será configurado pelo usuário
    sandboxMode: true
};

const AsaasAPI = {
    /**
     * Configura a API Key
     * @param {string} apiKey - API Key do Asaas
     */
    setApiKey(apiKey) {
        AsaasConfig.apiKey = apiKey;
        localStorage.setItem('asaasApiKey', apiKey);
    },

    /**
     * Recupera a API Key salva
     * @returns {string} API Key
     */
    getApiKey() {
        if (!AsaasConfig.apiKey) {
            AsaasConfig.apiKey = localStorage.getItem('asaasApiKey') || '';
        }
        return AsaasConfig.apiKey;
    },

    /**
     * Faz uma requisição para a API Asaas
     * @param {string} endpoint - Endpoint da API
     * @param {string} method - Método HTTP
     * @param {Object} data - Dados para enviar
     * @returns {Promise} Resposta da API
     */
    async request(endpoint, method = 'GET', data = null) {
        const apiKey = this.getApiKey();
        
        if (!apiKey) {
            throw new Error('API Key do Asaas não configurada. Configure em Configurações > Asaas API.');
        }

        const url = `${AsaasConfig.apiUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'access_token': apiKey,
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
                throw new Error(responseData.errors?.[0]?.description || `Erro na API: ${response.status}`);
            }

            return responseData;
        } catch (error) {
            console.error('Erro na requisição Asaas:', error);
            throw error;
        }
    },

    /**
     * Cria um cliente no Asaas
     * @param {Object} customerData - Dados do cliente
     * @returns {Promise} Cliente criado
     */
    async createCustomer(customerData) {
        return await this.request('/customers', 'POST', customerData);
    },

    /**
     * Busca cliente por CPF/CNPJ
     * @param {string} cpfCnpj - CPF ou CNPJ do cliente
     * @returns {Promise} Cliente encontrado ou null
     */
    async findCustomerByCpfCnpj(cpfCnpj) {
        try {
            const cleanCpfCnpj = cpfCnpj.replace(/\D/g, '');
            const response = await this.request(`/customers?cpfCnpj=${cleanCpfCnpj}`, 'GET');
            return response.data && response.data.length > 0 ? response.data[0] : null;
        } catch (error) {
            return null;
        }
    },

    /**
     * Lista clientes
     * @param {Object} filters - Filtros
     * @returns {Promise} Lista de clientes
     */
    async listCustomers(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = queryString ? `/customers?${queryString}` : '/customers';
        return await this.request(endpoint, 'GET');
    },

    /**
     * Cria uma cobrança
     * @param {Object} paymentData - Dados da cobrança
     * @returns {Promise} Cobrança criada
     */
    async createPayment(paymentData) {
        return await this.request('/payments', 'POST', paymentData);
    },

    /**
     * Busca cobrança por ID
     * @param {string} paymentId - ID da cobrança
     * @returns {Promise} Dados da cobrança
     */
    async getPayment(paymentId) {
        return await this.request(`/payments/${paymentId}`, 'GET');
    },

    /**
     * Lista cobranças
     * @param {Object} filters - Filtros
     * @returns {Promise} Lista de cobranças
     */
    async listPayments(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = queryString ? `/payments?${queryString}` : '/payments';
        return await this.request(endpoint, 'GET');
    },

    /**
     * Deleta uma cobrança
     * @param {string} paymentId - ID da cobrança
     * @returns {Promise} Confirmação
     */
    async deletePayment(paymentId) {
        return await this.request(`/payments/${paymentId}`, 'DELETE');
    }
};

/**
 * Gerenciador de Pagamentos de Contratos
 */
const ContractPaymentManager = {
    /**
     * Cria cliente e cobrança para um contrato
     * @param {Object} contractData - Dados do contrato
     * @returns {Promise} Cliente e cobrança criados
     */
    async createContractPayment(contractData) {
        try {
            // 1. Preparar dados do cliente
            const customerData = this.prepareCustomerData(contractData);

            // 2. Verificar se cliente já existe
            let customer = await AsaasAPI.findCustomerByCpfCnpj(customerData.cpfCnpj);

            // 3. Criar cliente se não existir
            if (!customer) {
                customer = await AsaasAPI.createCustomer(customerData);
                console.log('Cliente criado:', customer.id);
            } else {
                console.log('Cliente já existe:', customer.id);
            }

            // 4. Preparar dados da cobrança
            const paymentData = this.preparePaymentData(contractData, customer.id);

            // 5. Criar cobrança
            const payment = await AsaasAPI.createPayment(paymentData);
            console.log('Cobrança criada:', payment.id);

            // 6. Salvar referência
            this.savePaymentReference(contractData.contractNumber, customer, payment);

            return {
                customer,
                payment
            };
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            throw error;
        }
    },

    /**
     * Prepara dados do cliente para o Asaas
     * @param {Object} contractData - Dados do contrato
     * @returns {Object} Dados formatados do cliente
     */
    prepareCustomerData(contractData) {
        const cpfCnpj = (contractData.companyDocument || contractData.legalRepDocument || '').replace(/\D/g, '');
        
        return {
            name: contractData.companyName || contractData.legalRepName,
            cpfCnpj: cpfCnpj,
            email: contractData.email || contractData.companyEmail,
            phone: (contractData.phone || contractData.companyPhone || '').replace(/\D/g, ''),
            mobilePhone: (contractData.phone || contractData.companyPhone || '').replace(/\D/g, ''),
            address: this.extractAddress(contractData.companyAddress || contractData.address || ''),
            addressNumber: this.extractAddressNumber(contractData.companyAddress || contractData.address || ''),
            province: this.extractNeighborhood(contractData.companyAddress || contractData.address || ''),
            postalCode: this.extractPostalCode(contractData.companyAddress || contractData.address || ''),
            externalReference: contractData.contractNumber,
            notificationDisabled: false,
            observations: `Cliente do contrato ${contractData.contractNumber}`
        };
    },

    /**
     * Prepara dados da cobrança
     * @param {Object} contractData - Dados do contrato
     * @param {string} customerId - ID do cliente no Asaas
     * @returns {Object} Dados da cobrança
     */
    preparePaymentData(contractData, customerId) {
        // Extrair valor do contrato (remover R$ e converter)
        const value = this.parseValue(contractData.monthlyContractValue);
        
        // Data de vencimento (próximo mês, dia 10)
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + 1);
        dueDate.setDate(10);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        return {
            customer: customerId,
            billingType: 'BOLETO', // BOLETO, CREDIT_CARD, PIX, UNDEFINED
            value: value,
            dueDate: dueDateStr,
            description: `Mensalidade - Contrato ${contractData.contractNumber}`,
            externalReference: contractData.contractNumber,
            postalService: false,
            split: []
        };
    },

    /**
     * Extrai valor numérico de string de valor
     * @param {string} valueStr - String com valor (ex: "R$ 1.500,00")
     * @returns {number} Valor numérico
     */
    parseValue(valueStr) {
        if (!valueStr) return 0;
        return parseFloat(
            valueStr.replace(/[^\d,]/g, '').replace(',', '.')
        ) || 0;
    },

    /**
     * Extrai rua do endereço
     */
    extractAddress(fullAddress) {
        const parts = fullAddress.split(',');
        return parts[0]?.trim() || fullAddress;
    },

    /**
     * Extrai número do endereço
     */
    extractAddressNumber(fullAddress) {
        const match = fullAddress.match(/n[°º]?\s*(\d+)/i) || fullAddress.match(/,\s*(\d+)/);
        return match ? match[1] : 'S/N';
    },

    /**
     * Extrai bairro do endereço
     */
    extractNeighborhood(fullAddress) {
        const parts = fullAddress.split('-');
        if (parts.length > 1) {
            return parts[1].split(',')[0]?.trim() || 'Centro';
        }
        return 'Centro';
    },

    /**
     * Extrai CEP do endereço
     */
    extractPostalCode(fullAddress) {
        const match = fullAddress.match(/\d{5}-?\d{3}/);
        return match ? match[0].replace('-', '') : '';
    },

    /**
     * Salva referência do pagamento
     * @param {string} contractNumber - Número do contrato
     * @param {Object} customer - Cliente criado
     * @param {Object} payment - Cobrança criada
     */
    savePaymentReference(contractNumber, customer, payment) {
        const payments = this.getAllPayments();
        payments[contractNumber] = {
            customerId: customer.id,
            paymentId: payment.id,
            status: payment.status,
            value: payment.value,
            dueDate: payment.dueDate,
            invoiceUrl: payment.invoiceUrl,
            bankSlipUrl: payment.bankSlipUrl,
            createdAt: new Date().toISOString(),
            lastChecked: new Date().toISOString()
        };
        localStorage.setItem('contractPayments', JSON.stringify(payments));
    },

    /**
     * Recupera todas as referências de pagamento
     * @returns {Object} Pagamentos salvos
     */
    getAllPayments() {
        try {
            const data = localStorage.getItem('contractPayments');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
            return {};
        }
    },

    /**
     * Verifica status de pagamento de um contrato
     * @param {string} contractNumber - Número do contrato
     * @returns {Promise} Status atualizado
     */
    async checkPaymentStatus(contractNumber) {
        const payments = this.getAllPayments();
        const paymentRef = payments[contractNumber];

        if (!paymentRef) {
            throw new Error('Pagamento não encontrado para este contrato');
        }

        try {
            const payment = await AsaasAPI.getPayment(paymentRef.paymentId);
            
            // Atualizar status local
            paymentRef.status = payment.status;
            paymentRef.lastChecked = new Date().toISOString();
            paymentRef.invoiceUrl = payment.invoiceUrl;
            paymentRef.bankSlipUrl = payment.bankSlipUrl;
            payments[contractNumber] = paymentRef;
            localStorage.setItem('contractPayments', JSON.stringify(payments));

            return payment;
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    },

    /**
     * Lista pagamentos pendentes
     * @returns {Array} Pagamentos pendentes
     */
    getPendingPayments() {
        const payments = this.getAllPayments();
        return Object.entries(payments)
            .filter(([_, payment]) => payment.status === 'PENDING')
            .map(([contractNumber, payment]) => ({
                contractNumber,
                ...payment
            }));
    }
};

/**
 * Interface de Configuração do Asaas
 */
function showAsaasConfig() {
    const currentKey = AsaasAPI.getApiKey();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Configuração Asaas API</h5>
                    <button type="button" class="close" onclick="closeAsaasConfig()">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <strong>Ambiente Sandbox</strong><br>
                        Você está usando o ambiente de testes do Asaas.<br>
                        URL: <code>https://sandbox.asaas.com/api/v3/</code>
                    </div>
                    <div class="form-group">
                        <label for="asaasApiKey">API Key:</label>
                        <input type="password" 
                               class="form-control" 
                               id="asaasApiKey" 
                               value="${currentKey}"
                               placeholder="Cole sua API Key do Asaas">
                        <small class="form-text text-muted">
                            Obtenha sua API Key em: 
                            <a href="https://www.asaas.com/config/api" target="_blank">
                                Asaas > Configurações > Integrações > API
                            </a>
                        </small>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary btn-block" onclick="testAsaasConnection()">
                            <i class="fas fa-check-circle"></i> Testar Conexão
                        </button>
                    </div>
                    <div id="asaasConnectionResult"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeAsaasConfig()">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveAsaasApiKey()">
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'asaasBackdrop';
    document.body.appendChild(backdrop);
}

function closeAsaasConfig() {
    const modal = document.querySelector('.modal');
    const backdrop = document.getElementById('asaasBackdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
}

function saveAsaasApiKey() {
    const keyInput = document.getElementById('asaasApiKey');
    const apiKey = keyInput.value.trim();
    
    if (!apiKey) {
        alert('Por favor, insira a API Key.');
        return;
    }
    
    AsaasAPI.setApiKey(apiKey);
    alert('API Key salva com sucesso!');
    closeAsaasConfig();
}

async function testAsaasConnection() {
    const resultDiv = document.getElementById('asaasConnectionResult');
    const keyInput = document.getElementById('asaasApiKey');
    const apiKey = keyInput.value.trim();
    
    if (!apiKey) {
        resultDiv.innerHTML = `
            <div class="alert alert-warning">
                Por favor, insira a API Key antes de testar.
            </div>
        `;
        return;
    }
    
    const oldKey = AsaasAPI.getApiKey();
    AsaasAPI.setApiKey(apiKey);
    
    resultDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> Testando conexão...
        </div>
    `;
    
    try {
        await AsaasAPI.listCustomers({ limit: 1 });
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
        AsaasAPI.setApiKey(oldKey);
    }
}

/**
 * Mostra painel de pagamentos pendentes
 */
function showPendingPayments() {
    const pending = ContractPaymentManager.getPendingPayments();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Pagamentos Pendentes</h5>
                    <button type="button" class="close" onclick="closePendingPaymentsModal()">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${pending.length === 0 ? `
                        <div class="alert alert-info">
                            Nenhum pagamento pendente.
                        </div>
                    ` : `
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Contrato</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pending.map(payment => `
                                    <tr>
                                        <td>${payment.contractNumber}</td>
                                        <td>R$ ${payment.value.toFixed(2)}</td>
                                        <td>${new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                            <span class="badge badge-warning">${payment.status}</span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-info" 
                                                    onclick="checkPaymentStatusUI('${payment.contractNumber}')">
                                                <i class="fas fa-sync"></i> Atualizar
                                            </button>
                                            ${payment.bankSlipUrl ? `
                                                <a href="${payment.bankSlipUrl}" target="_blank" class="btn btn-sm btn-success">
                                                    <i class="fas fa-barcode"></i> Boleto
                                                </a>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closePendingPaymentsModal()">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'pendingPaymentsBackdrop';
    document.body.appendChild(backdrop);
}

function closePendingPaymentsModal() {
    const modal = document.querySelector('.modal');
    const backdrop = document.getElementById('pendingPaymentsBackdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
}

async function checkPaymentStatusUI(contractNumber) {
    try {
        const payment = await ContractPaymentManager.checkPaymentStatus(contractNumber);
        alert(`Status atualizado: ${payment.status}\nÚltima atualização: ${new Date().toLocaleString('pt-BR')}`);
        
        closePendingPaymentsModal();
        showPendingPayments();
    } catch (error) {
        alert(`Erro ao atualizar status: ${error.message}`);
    }
}

// Exportar para uso global
window.AsaasAPI = AsaasAPI;
window.ContractPaymentManager = ContractPaymentManager;
window.showAsaasConfig = showAsaasConfig;
window.showPendingPayments = showPendingPayments;
