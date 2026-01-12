/**
 * Gerenciador de Formulário de Contrato
 * Sistema de validação e processamento de dados contratuais
 */

// ========== Sistema de Banco de Dados de Contratos ==========

const ContractDatabase = {
    /**
     * Salva um contrato no banco de dados
     * @param {Object} contractData - Dados do contrato
     * @returns {boolean} Sucesso da operação
     */
    saveContract(contractData) {
        try {
            const contracts = this.getAllContracts();
            const contractId = contractData.contractNumber || `TEMP-${Date.now()}`;
            
            contracts[contractId] = {
                ...contractData,
                savedAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
            
            localStorage.setItem('contractsDatabase', JSON.stringify(contracts));
            
            // Atualizar último número de contrato
            this.updateLastContractNumber(contractData.contractNumber);
            
            return true;
        } catch (error) {
            console.error('Erro ao salvar contrato:', error);
            return false;
        }
    },

    /**
     * Recupera todos os contratos
     * @returns {Object} Objeto com todos os contratos
     */
    getAllContracts() {
        try {
            const data = localStorage.getItem('contractsDatabase');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Erro ao carregar contratos:', error);
            return {};
        }
    },

    /**
     * Recupera um contrato específico
     * @param {string} contractId - ID do contrato
     * @returns {Object|null} Dados do contrato ou null
     */
    getContract(contractId) {
        const contracts = this.getAllContracts();
        return contracts[contractId] || null;
    },

    /**
     * Deleta um contrato
     * @param {string} contractId - ID do contrato
     * @returns {boolean} Sucesso da operação
     */
    deleteContract(contractId) {
        try {
            const contracts = this.getAllContracts();
            delete contracts[contractId];
            localStorage.setItem('contractsDatabase', JSON.stringify(contracts));
            return true;
        } catch (error) {
            console.error('Erro ao deletar contrato:', error);
            return false;
        }
    },

    /**
     * Atualiza o último número de contrato usado
     * @param {string} contractNumber - Número do contrato
     */
    updateLastContractNumber(contractNumber) {
        if (!contractNumber) return;
        
        // Extrair número sequencial (ex: "CEF 183-2025" -> 183)
        const match = contractNumber.match(/(\d+)-(\d+)/);
        if (match) {
            const sequential = parseInt(match[1]);
            const year = parseInt(match[2]);
            
            localStorage.setItem('lastContractNumber', JSON.stringify({
                sequential,
                year,
                fullNumber: contractNumber
            }));
        }
    },

    /**
     * Gera o próximo número de contrato
     * @returns {string} Próximo número de contrato
     */
    generateNextContractNumber() {
        try {
            const lastData = localStorage.getItem('lastContractNumber');
            const currentYear = new Date().getFullYear();
            
            if (lastData) {
                const last = JSON.parse(lastData);
                
                // Se mudou o ano, reinicia a contagem
                if (last.year !== currentYear) {
                    return `CEF 001-${currentYear}`;
                }
                
                // Incrementa o número sequencial
                const nextSequential = (last.sequential + 1).toString().padStart(3, '0');
                return `CEF ${nextSequential}-${currentYear}`;
            }
            
            // Primeiro contrato
            return `CEF 001-${currentYear}`;
        } catch (error) {
            console.error('Erro ao gerar número de contrato:', error);
            return `CEF 001-${new Date().getFullYear()}`;
        }
    },

    /**
     * Exporta todos os contratos para JSON
     * @returns {string} JSON com todos os contratos
     */
    exportToJSON() {
        const contracts = this.getAllContracts();
        return JSON.stringify(contracts, null, 2);
    },

    /**
     * Importa contratos de JSON
     * @param {string} jsonData - Dados em JSON
     * @returns {boolean} Sucesso da operação
     */
    importFromJSON(jsonData) {
        try {
            const contracts = JSON.parse(jsonData);
            localStorage.setItem('contractsDatabase', JSON.stringify(contracts));
            return true;
        } catch (error) {
            console.error('Erro ao importar contratos:', error);
            return false;
        }
    }
};

// ========== Funções de Interface para Histórico e Contratos ==========

/**
 * Gera automaticamente o próximo número de contrato
 */
function generateNextContractNumber() {
    const nextNumber = ContractDatabase.generateNextContractNumber();
    const input = document.getElementById('contractNumber');
    if (input) {
        input.value = nextNumber;
        input.focus();
    }
}

/**
 * Mostra o histórico de contratos salvos
 */
function showContractHistory() {
    const contracts = ContractDatabase.getAllContracts();
    const contractIds = Object.keys(contracts);
    
    if (contractIds.length === 0) {
        alert('Nenhum contrato salvo ainda.');
        return;
    }
    
    // Criar modal HTML
    const modal = document.createElement('div');
    modal.className = 'contract-history-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeHistoryModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Histórico de Contratos</h3>
                <button class="btn-close" onclick="closeHistoryModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="contracts-list">
                    ${contractIds.map(id => {
                        const contract = contracts[id];
                        return `
                            <div class="contract-item">
                                <div class="contract-info">
                                    <strong>${id}</strong>
                                    <br>
                                    <small>${contract.companyName}</small>
                                    <br>
                                    <small class="text-muted">Salvo em: ${new Date(contract.savedAt).toLocaleString('pt-BR')}</small>
                                </div>
                                <div class="contract-actions">
                                    <button class="btn btn-sm btn-primary" onclick="loadContract('${id}')">
                                        Carregar
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteContractFromUI('${id}')">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="exportContracts()">
                    Exportar Todos
                </button>
                <button class="btn btn-secondary" onclick="closeHistoryModal()">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Fecha o modal de histórico
 */
function closeHistoryModal() {
    const modal = document.querySelector('.contract-history-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Carrega um contrato do histórico
 * @param {string} contractId - ID do contrato
 */
function loadContract(contractId) {
    const contract = ContractDatabase.getContract(contractId);
    if (!contract) {
        alert('Contrato não encontrado.');
        return;
    }
    
    // Preencher todos os campos do formulário
    if (contract.contractNumber) document.getElementById('contractNumber').value = contract.contractNumber;
    if (contract.companyName) document.getElementById('companyName').value = contract.companyName;
    if (contract.companyDocument) document.getElementById('companyDocument').value = contract.companyDocument;
    if (contract.companyActivity) document.getElementById('companyActivity').value = contract.companyActivity;
    if (contract.companyAddress) document.getElementById('companyAddress').value = contract.companyAddress;
    if (contract.companyPhone) document.getElementById('companyPhone').value = contract.companyPhone;
    if (contract.companyEmail) document.getElementById('companyEmail').value = contract.companyEmail;
    
    if (contract.legalRepName) document.getElementById('legalRepName').value = contract.legalRepName;
    if (contract.legalRepDocument) document.getElementById('legalRepDocument').value = contract.legalRepDocument;
    if (contract.legalRepRole) document.getElementById('legalRepRole').value = contract.legalRepRole;
    if (contract.legalRepType) {
        const radioButton = document.querySelector(`input[name="legalRepType"][value="${contract.legalRepType}"]`);
        if (radioButton) radioButton.checked = true;
    }
    if (contract.legalRepPhone) document.getElementById('legalRepPhone').value = contract.legalRepPhone;
    if (contract.legalRepEmail) document.getElementById('legalRepEmail').value = contract.legalRepEmail;
    
    if (contract.roomAdminAuthorized) {
        document.getElementById('roomAdminAuthorized').checked = contract.roomAdminAuthorized;
        const adminField = document.getElementById('roomAdminDocumentGroup');
        if (adminField) adminField.style.display = 'block';
        if (contract.roomAdminName) document.getElementById('roomAdminName').value = contract.roomAdminName;
        if (contract.roomAdminDocument) document.getElementById('roomAdminDocument').value = contract.roomAdminDocument;
    }
    
    // Carregar especificações
    if (contract.contractSpecs && contract.contractSpecs.length > 0) {
        const tbody = document.getElementById('contractSpecBody');
        tbody.innerHTML = '';
        
        contract.contractSpecs.forEach((spec) => {
            const row = document.createElement('tr');
            row.className = 'spec-row';
            row.innerHTML = `
                <td><input type="text" class="form-control form-control-sm" value="${spec.item}" readonly></td>
                <td><input type="text" class="form-control form-control-sm" value="${spec.benefit}"></td>
                <td><input type="text" class="form-control form-control-sm" value="${spec.monthlyValue}"></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeSpecRow(this)">×</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    if (contract.totalBenefits) document.getElementById('totalBenefits').value = contract.totalBenefits;
    if (contract.discountAmount) document.getElementById('discountAmount').value = contract.discountAmount;
    if (contract.totalWithDiscount) document.getElementById('totalWithDiscount').value = contract.totalWithDiscount;
    if (contract.monthlyContractValue) document.getElementById('monthlyContractValue').value = contract.monthlyContractValue;
    if (contract.discountDescription) document.getElementById('discountDescription').value = contract.discountDescription;
    
    closeHistoryModal();
    alert('Contrato carregado com sucesso!');
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Deleta um contrato do histórico
 * @param {string} contractId - ID do contrato
 */
function deleteContractFromUI(contractId) {
    if (confirm(`Tem certeza que deseja excluir o contrato ${contractId}?`)) {
        if (ContractDatabase.deleteContract(contractId)) {
            alert('Contrato excluído com sucesso!');
            closeHistoryModal();
            showContractHistory();
        } else {
            alert('Erro ao excluir contrato.');
        }
    }
}

/**
 * Exporta todos os contratos para arquivo JSON
 */
function exportContracts() {
    const jsonData = ContractDatabase.exportToJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contratos_backup_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Contratos exportados com sucesso!');
}

// ========== Funções de Gerenciamento de Especificações do Contrato ==========

/**
 * Adiciona uma nova linha na tabela de especificações
 */
function addSpecRow() {
    const tbody = document.getElementById('contractSpecBody');
    const rowCount = tbody.querySelectorAll('.spec-row').length + 1;
    const itemNumber = String(rowCount).padStart(2, '0');
    
    const newRow = document.createElement('tr');
    newRow.className = 'spec-row';
    newRow.innerHTML = `
        <td class="spec-item-number"><input type="text" class="form-control form-control-sm text-center" value="${itemNumber}" readonly></td>
        <td class="spec-benefits"><textarea class="form-control form-control-sm" rows="2" placeholder="Descrição do benefício"></textarea></td>
        <td class="spec-value"><input type="text" class="form-control form-control-sm" placeholder="R$ 0,00"></td>
        <td class="text-center spec-actions">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeSpecRow(this)" title="Remover">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
    
    tbody.appendChild(newRow);
    updateItemNumbers();
}

/**
 * Remove uma linha da tabela de especificações
 * @param {HTMLElement} button - Botão de remoção clicado
 */
function removeSpecRow(button) {
    const row = button.closest('tr');
    const tbody = document.getElementById('contractSpecBody');
    
    // Não permitir remover se houver apenas uma linha
    if (tbody.querySelectorAll('.spec-row').length <= 1) {
        alert('Deve haver pelo menos uma especificação no contrato.');
        return;
    }
    
    row.remove();
    updateItemNumbers();
}

/**
 * Atualiza a numeração dos itens após adicionar ou remover linhas
 */
function updateItemNumbers() {
    const rows = document.querySelectorAll('#contractSpecBody .spec-row');
    rows.forEach((row, index) => {
        const itemInput = row.querySelector('td:first-child input');
        itemInput.value = String(index + 1).padStart(2, '0');
    });
}

/**
 * Coleta dados das especificações do contrato
 * @returns {Array} Array com as especificações
 */
function collectContractSpecs() {
    const specs = [];
    const rows = document.querySelectorAll('#contractSpecBody .spec-row');
    
    rows.forEach((row) => {
        const itemInput = row.querySelector('.spec-item-number input');
        const benefitTextarea = row.querySelector('.spec-benefits textarea');
        const valueInput = row.querySelector('.spec-value input');
        
        specs.push({
            item: itemInput?.value || '',
            benefit: benefitTextarea?.value || '',
            monthlyValue: valueInput?.value || ''
        });
    });
    
    return specs;
}

// Constantes de validação
const VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
};

// Utilitários de formatação
const Formatter = {
    /**
     * Formata número de telefone
     * @param {string} value - Valor do input
     * @returns {string} Telefone formatado
     */
    formatPhone(value) {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 10) {
            return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },

    /**
     * Formata CPF
     * @param {string} value - Valor do input
     * @returns {string} CPF formatado
     */
    formatCPF(value) {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    /**
     * Formata CNPJ
     * @param {string} value - Valor do input
     * @returns {string} CNPJ formatado
     */
    formatCNPJ(value) {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
};

// Validador de formulário
const FormValidator = {
    /**
     * Valida campo de email
     * @param {string} email - Email a ser validado
     * @returns {boolean} Resultado da validação
     */
    validateEmail(email) {
        return VALIDATION_PATTERNS.email.test(email);
    },

    /**
     * Valida campo de telefone
     * @param {string} phone - Telefone a ser validado
     * @returns {boolean} Resultado da validação
     */
    validatePhone(phone) {
        const numbers = phone.replace(/\D/g, '');
        return numbers.length >= 10 && numbers.length <= 11;
    },

    /**
     * Valida todos os campos do formulário
     * @param {Object} formData - Dados do formulário
     * @returns {Object} Resultado da validação com erros
     */
    validateForm(formData) {
        const errors = [];

        // Validar emails
        if (!this.validateEmail(formData.companyEmail)) {
            errors.push('E-mail da empresa inválido');
        }
        if (!this.validateEmail(formData.legalRepEmail)) {
            errors.push('E-mail do representante legal inválido');
        }

        // Validar telefones
        if (!this.validatePhone(formData.companyPhone)) {
            errors.push('Telefone da empresa inválido');
        }
        if (!this.validatePhone(formData.legalRepPhone)) {
            errors.push('Telefone do representante legal inválido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Gerenciador de dados
const DataManager = {
    /**
     * Salva dados no localStorage
     * @param {Object} data - Dados a serem salvos
     */
    saveFormData(data) {
        try {
            localStorage.setItem('formData', JSON.stringify(data));
            localStorage.setItem('formDataTimestamp', new Date().toISOString());
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            throw new Error('Não foi possível salvar os dados do formulário');
        }
    },

    /**
     * Carrega dados do localStorage
     * @returns {Object|null} Dados salvos ou null
     */
    loadFormData() {
        try {
            const data = localStorage.getItem('formData');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return null;
        }
    },

    /**
     * Limpa dados salvos
     */
    clearFormData() {
        localStorage.removeItem('formData');
        localStorage.removeItem('formDataTimestamp');
    }
};

// Gerenciador de UI
const UIManager = {
    /**
     * Exibe mensagem de erro
     * @param {Array<string>} errors - Lista de erros
     */
    showErrors(errors) {
        const errorMessage = errors.join('\n');
        alert('Por favor, corrija os seguintes erros:\n\n' + errorMessage);
    },

    /**
     * Exibe mensagem de sucesso
     * @param {string} message - Mensagem a ser exibida
     */
    showSuccess(message) {
        alert(message);
    },

    /**
     * Adiciona loading no botão
     * @param {HTMLElement} button - Botão do formulário
     * @param {boolean} loading - Estado de loading
     */
    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Processando...';
        } else {
            button.disabled = false;
            button.innerHTML = 'Prosseguir com o Contrato';
        }
    }
};

// Aplicar máscaras de formatação
function applyInputMasks() {
    // Máscara de telefone
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = Formatter.formatPhone(e.target.value);
        });
    });

    // Máscara de CPF
    const cpfInputs = document.querySelectorAll('#legalRepDocument, #roomAdminDocument');
    cpfInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const numbers = e.target.value.replace(/\D/g, '');
            if (numbers.length <= 11) {
                e.target.value = Formatter.formatCPF(e.target.value);
            }
        });
    });

    // Máscara de CNPJ
    const cnpjInput = document.getElementById('companyDocument');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            const numbers = e.target.value.replace(/\D/g, '');
            if (numbers.length <= 14) {
                e.target.value = Formatter.formatCNPJ(e.target.value);
            }
        });
    }
}

// Gerenciar visibilidade do campo de administrador
function setupAdminFieldToggle() {
    const checkbox = document.getElementById('roomAdminAuthorized');
    const adminField = document.getElementById('roomAdminDocumentGroup');
    
    if (checkbox && adminField) {
        checkbox.addEventListener('change', () => {
            adminField.style.display = checkbox.checked ? 'block' : 'none';
            const input = document.getElementById('roomAdminDocument');
            if (!checkbox.checked && input) {
                input.value = '';
            }
        });
    }
}

// Coletar dados do formulário
function collectFormData() {
    return {
        // Informações do Contrato
        contractNumber: document.getElementById('contractNumber')?.value.trim() || '',
        
        // Especificações do Contrato
        contractSpecs: collectContractSpecs(),
        totalBenefits: document.getElementById('totalBenefits')?.value.trim() || '',
        discountAmount: document.getElementById('discountAmount')?.value.trim() || '',
        totalWithDiscount: document.getElementById('totalWithDiscount')?.value.trim() || '',
        monthlyContractValue: document.getElementById('monthlyContractValue')?.value.trim() || '',
        discountDescription: document.getElementById('discountDescription')?.value.trim() || '',
        
        // Dados da Empresa
        companyName: document.getElementById('companyName').value.trim(),
        companyDocument: document.getElementById('companyDocument').value.trim(),
        companyActivity: document.getElementById('companyActivity').value.trim(),
        companyAddress: document.getElementById('companyAddress').value.trim(),
        companyPhone: document.getElementById('companyPhone').value.trim(),
        companyEmail: document.getElementById('companyEmail').value.trim(),
        
        // Dados do Representante Legal
        legalRepName: document.getElementById('legalRepName').value.trim(),
        legalRepDocument: document.getElementById('legalRepDocument').value.trim(),
        legalRepRole: document.getElementById('legalRepRole').value.trim(),
        legalRepType: document.querySelector('input[name="legalRepType"]:checked')?.value || '',
        legalRepPhone: document.getElementById('legalRepPhone').value.trim(),
        legalRepEmail: document.getElementById('legalRepEmail').value.trim(),
        
        // Administração da Sala
        roomAdminAuthorized: document.getElementById('roomAdminAuthorized').checked,
        roomAdminName: document.getElementById('roomAdminName')?.value.trim() || '',
        roomAdminDocument: document.getElementById('roomAdminDocument')?.value.trim() || '',
        roomAdminAuthorized: document.getElementById('roomAdminAuthorized').checked,
        roomAdminDocument: document.getElementById('roomAdminDocument')?.value.trim() || '',
        acceptTerms: document.getElementById('acceptTerms').checked,
        submissionDate: new Date().toLocaleString('pt-BR')
    };
}

// Processar submissão do formulário
function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    try {
        // Coletar dados
        const formData = collectFormData();
        
        // Validar aceite dos termos
        if (!formData.acceptTerms) {
            UIManager.showErrors(['Você deve aceitar as cláusulas contratuais para prosseguir']);
            return;
        }
        
        // Validar dados
        const validation = FormValidator.validateForm(formData);
        if (!validation.isValid) {
            UIManager.showErrors(validation.errors);
            return;
        }
        
        // Exibir loading
        UIManager.setButtonLoading(submitButton, true);
        
        // Simular pequeno delay de processamento
        setTimeout(() => {
            // Salvar dados no localStorage temporário
            DataManager.saveFormData(formData);
            
            // Salvar no banco de dados de contratos
            const saved = ContractDatabase.saveContract(formData);
            if (saved) {
                console.log('Contrato salvo no banco de dados com sucesso!');
            }
            
            // Redirecionar para página de revisão
            window.location.href = 'review.html';
        }, 500);
        
    } catch (error) {
        console.error('Erro ao processar formulário:', error);
        UIManager.showErrors(['Ocorreu um erro ao processar o formulário. Tente novamente.']);
        UIManager.setButtonLoading(submitButton, false);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contractForm');
    
    if (form) {
        // Configurar máscaras de entrada
        applyInputMasks();
        
        // Configurar toggle do campo de administrador
        setupAdminFieldToggle();
        
        // Configurar submissão do formulário
        form.addEventListener('submit', handleFormSubmit);
        
        // Gerar automaticamente o próximo número de contrato se estiver vazio
        const contractNumberInput = document.getElementById('contractNumber');
        if (contractNumberInput && !contractNumberInput.value) {
            contractNumberInput.value = ContractDatabase.generateNextContractNumber();
        }
        
        console.log('Formulário de contrato inicializado com sucesso');
    }
    
    // Inicializar sistema de navegação
    initNavigation();
    
    // Inicializar dashboard
    initDashboard();
});

/* ==========================================================================
   Sistema de Navegação e Menu
   ========================================================================== */

function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Navegação do menu
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.getAttribute('data-page');
            navigateToPage(page);
            
            // Fechar sidebar em mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        });
    });
    
    // Toggle sidebar desktop
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Toggle sidebar mobile
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
    
    // Fechar sidebar ao clicar fora (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
}

function navigateToPage(page) {
    // Remover classe active de todos os itens do menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Adicionar classe active ao item clicado
    const activeItem = document.querySelector(`.menu-item[data-page="${page}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Esconder todas as páginas
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Mostrar página selecionada
    const activePage = document.getElementById(`${page}Page`);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Atualizar título
    const titles = {
        dashboard: 'Dashboard',
        contracts: 'Novo Contrato',
        signatures: 'Assinaturas',
        payments: 'Pagamentos',
        history: 'Histórico',
        settings: 'Configurações'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[page] || 'Sistema';
    }
    
    // Carregar dados específicos da página
    if (page === 'dashboard') {
        updateDashboard();
    } else if (page === 'signatures') {
        loadSignatures();
    } else if (page === 'payments') {
        loadPayments();
    } else if (page === 'history') {
        loadHistory();
    }
}

/* ==========================================================================
   Sistema de Dashboard
   ========================================================================== */

function initDashboard() {
    updateDashboard();
    
    // Atualizar a cada 30 segundos
    setInterval(updateDashboard, 30000);
}

function updateDashboard() {
    try {
        const contracts = ContractDatabase.getAllContracts();
        const contractsList = Object.values(contracts);
        
        // Contar contratos pendentes (sem assinatura)
        const pendingContracts = contractsList.filter(c => !c.signed).length;
        document.getElementById('pendingContractsCount').textContent = pendingContracts;
        
        // Contar contratos assinados
        const signedContracts = contractsList.filter(c => c.signed).length;
        document.getElementById('signedContractsCount').textContent = signedContracts;
        
        // Buscar dados de pagamento do Asaas
        updatePaymentMetrics();
        
        // Atualizar atividades recentes
        updateRecentActivity(contractsList);
        
    } catch (error) {
        console.error('Erro ao atualizar dashboard:', error);
    }
}

function updatePaymentMetrics() {
    try {
        const asaasConfig = AsaasIntegration.getConfig();
        
        if (asaasConfig && asaasConfig.apiKey) {
            // Buscar pagamentos do Asaas
            fetch(`https://sandbox.asaas.com/api/v3/payments?status=PENDING&limit=100`, {
                headers: {
                    'access_token': asaasConfig.apiKey,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.data) {
                    const pendingPayments = data.data.length;
                    document.getElementById('pendingPaymentsCount').textContent = pendingPayments;
                    
                    // Calcular receita do mês
                    const totalRevenue = data.data.reduce((sum, payment) => sum + (payment.value || 0), 0);
                    document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
                }
            })
            .catch(error => {
                console.error('Erro ao buscar dados do Asaas:', error);
                document.getElementById('pendingPaymentsCount').textContent = '0';
                document.getElementById('totalRevenue').textContent = 'R$ 0,00';
            });
        } else {
            document.getElementById('pendingPaymentsCount').textContent = '0';
            document.getElementById('totalRevenue').textContent = 'R$ 0,00';
        }
    } catch (error) {
        console.error('Erro ao atualizar métricas de pagamento:', error);
    }
}

function updateRecentActivity(contracts) {
    const activityList = document.getElementById('recentActivity');
    
    if (!contracts || contracts.length === 0) {
        activityList.innerHTML = '<p class="text-muted text-center">Nenhuma atividade recente</p>';
        return;
    }
    
    // Ordenar por data (mais recentes primeiro)
    const sortedContracts = contracts
        .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))
        .slice(0, 5);
    
    let html = '';
    sortedContracts.forEach(contract => {
        const date = new Date(contract.savedAt);
        const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
        const status = contract.signed ? 'Assinado' : 'Pendente';
        const statusClass = contract.signed ? 'badge-success' : 'badge-warning';
        
        html += `
            <div class="activity-item">
                <div class="activity-date">${formattedDate}</div>
                <div>
                    <strong>${contract.companyName || 'Empresa'}</strong>
                    <span class="badge ${statusClass} ml-2">${status}</span>
                </div>
                <div class="text-muted">Contrato: ${contract.contractNumber || 'N/A'}</div>
            </div>
        `;
    });
    
    activityList.innerHTML = html;
}

/* ==========================================================================
   Carregamento de Páginas
   ========================================================================== */

function loadSignatures() {
    const signaturesList = document.getElementById('pendingSignaturesList');
    
    // Buscar assinaturas do ZapSign
    const zapSignConfig = ZapSignIntegration.getConfig();
    
    if (!zapSignConfig || !zapSignConfig.apiToken) {
        signaturesList.innerHTML = '<p class="text-muted text-center">Configure a integração com ZapSign primeiro</p>';
        return;
    }
    
    signaturesList.innerHTML = '<p class="text-muted text-center"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
    
    // Aqui você implementaria a lógica para buscar do ZapSign
    // Por enquanto, vamos mostrar uma mensagem
    setTimeout(() => {
        signaturesList.innerHTML = '<p class="text-muted text-center">Nenhum contrato pendente de assinatura</p>';
    }, 1000);
}

function loadPayments() {
    const paymentsList = document.getElementById('paymentsList');
    
    const asaasConfig = AsaasIntegration.getConfig();
    
    if (!asaasConfig || !asaasConfig.apiKey) {
        paymentsList.innerHTML = '<p class="text-muted text-center">Configure a integração com Asaas primeiro</p>';
        return;
    }
    
    paymentsList.innerHTML = '<p class="text-muted text-center"><i class="fas fa-spinner fa-spin"></i> Carregando...</p>';
    
    // Buscar pagamentos
    fetch(`https://sandbox.asaas.com/api/v3/payments?limit=50`, {
        headers: {
            'access_token': asaasConfig.apiKey,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.data && data.data.length > 0) {
            let html = '<div class="table-responsive"><table class="table table-striped">';
            html += '<thead><tr><th>Cliente</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead><tbody>';
            
            data.data.forEach(payment => {
                const statusMap = {
                    'PENDING': 'Pendente',
                    'RECEIVED': 'Recebido',
                    'CONFIRMED': 'Confirmado',
                    'OVERDUE': 'Vencido'
                };
                
                html += `
                    <tr>
                        <td>${payment.customer || 'N/A'}</td>
                        <td>R$ ${(payment.value || 0).toFixed(2).replace('.', ',')}</td>
                        <td>${new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td><span class="badge badge-${payment.status === 'RECEIVED' ? 'success' : 'warning'}">${statusMap[payment.status] || payment.status}</span></td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
            paymentsList.innerHTML = html;
            
            // Atualizar contadores
            const pending = data.data.filter(p => p.status === 'PENDING').length;
            const received = data.data.filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED').length;
            const overdue = data.data.filter(p => p.status === 'OVERDUE').length;
            
            document.getElementById('paymentsPagePendingCount').textContent = pending;
            document.getElementById('paymentsPageReceivedCount').textContent = received;
            document.getElementById('paymentsPageOverdueCount').textContent = overdue;
        } else {
            paymentsList.innerHTML = '<p class="text-muted text-center">Nenhuma cobrança cadastrada</p>';
        }
    })
    .catch(error => {
        console.error('Erro ao buscar pagamentos:', error);
        paymentsList.innerHTML = '<p class="text-danger text-center">Erro ao carregar pagamentos</p>';
    });
}

function loadHistory() {
    const historyList = document.getElementById('contractHistoryList');
    const contracts = ContractDatabase.getAllContracts();
    const contractsList = Object.values(contracts);
    
    if (contractsList.length === 0) {
        historyList.innerHTML = '<p class="text-muted text-center">Nenhum contrato no histórico</p>';
        return;
    }
    
    // Ordenar por data
    const sortedContracts = contractsList.sort((a, b) => 
        new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
    );
    
    let html = '<div class="table-responsive"><table class="table table-striped">';
    html += '<thead><tr><th>Número</th><th>Empresa</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead><tbody>';
    
    sortedContracts.forEach(contract => {
        const date = new Date(contract.savedAt);
        const formattedDate = date.toLocaleDateString('pt-BR');
        const status = contract.signed ? 'Assinado' : 'Pendente';
        const statusClass = contract.signed ? 'badge-success' : 'badge-warning';
        
        html += `
            <tr>
                <td>${contract.contractNumber || 'N/A'}</td>
                <td>${contract.companyName || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewContract('${contract.contractNumber}')" title="Ver contrato">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editContract('${contract.contractNumber}')" title="Editar contrato">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    historyList.innerHTML = html;
}

function viewContract(contractNumber) {
    const contracts = ContractDatabase.getAllContracts();
    const contract = contracts[contractNumber];
    
    if (!contract) {
        alert('Contrato não encontrado!');
        return;
    }
    
    // Criar modal de visualização
    const modal = document.createElement('div');
    modal.className = 'contract-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeContractModal()"></div>
        <div class="modal-content contract-view">
            <div class="modal-header">
                <h3><i class="fas fa-file-contract"></i> Detalhes do Contrato</h3>
                <button class="btn-close" onclick="closeContractModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="contract-info-grid">
                    <div class="info-item">
                        <strong>Número do Contrato:</strong>
                        <span>${contract.contractNumber || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Status:</strong>
                        <span class="badge ${contract.signed ? 'badge-success' : 'badge-warning'}">
                            ${contract.signed ? 'Assinado' : 'Pendente'}
                        </span>
                    </div>
                    <div class="info-item">
                        <strong>Empresa:</strong>
                        <span>${contract.companyName || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>CNPJ:</strong>
                        <span>${contract.companyDocument || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Atividade:</strong>
                        <span>${contract.companyActivity || 'N/A'}</span>
                    </div>
                    <div class="info-item full-width">
                        <strong>Endereço:</strong>
                        <span>${contract.companyAddress || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Telefone:</strong>
                        <span>${contract.companyPhone || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>E-mail:</strong>
                        <span>${contract.companyEmail || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Representante Legal:</strong>
                        <span>${contract.legalRepName || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>CPF:</strong>
                        <span>${contract.legalRepDocument || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Valor Mensal:</strong>
                        <span class="value-highlight">${contract.monthlyContractValue || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Data de Criação:</strong>
                        <span>${new Date(contract.savedAt).toLocaleString('pt-BR')}</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="editContract('${contractNumber}'); closeContractModal();">
                    <i class="fas fa-edit"></i> Editar Contrato
                </button>
                <button class="btn btn-secondary" onclick="closeContractModal()">
                    <i class="fas fa-times"></i> Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function editContract(contractNumber) {
    const contracts = ContractDatabase.getAllContracts();
    const contract = contracts[contractNumber];
    
    if (!contract) {
        alert('Contrato não encontrado!');
        return;
    }
    
    // Navegar para página de contratos
    navigateToPage('contracts');
    
    // Aguardar a página carregar e então preencher os campos
    setTimeout(() => {
        // Preencher campos do formulário
        document.getElementById('contractNumber').value = contract.contractNumber || '';
        document.getElementById('companyName').value = contract.companyName || '';
        document.getElementById('companyDocument').value = contract.companyDocument || '';
        document.getElementById('companyActivity').value = contract.companyActivity || '';
        document.getElementById('companyAddress').value = contract.companyAddress || '';
        document.getElementById('companyPhone').value = contract.companyPhone || '';
        document.getElementById('companyEmail').value = contract.companyEmail || '';
        
        document.getElementById('legalRepName').value = contract.legalRepName || '';
        document.getElementById('legalRepDocument').value = contract.legalRepDocument || '';
        document.getElementById('legalRepRole').value = contract.legalRepRole || '';
        document.getElementById('legalRepPhone').value = contract.legalRepPhone || '';
        document.getElementById('legalRepEmail').value = contract.legalRepEmail || '';
        
        if (contract.legalRepType) {
            const radioButton = document.querySelector(`input[name="legalRepType"][value="${contract.legalRepType}"]`);
            if (radioButton) radioButton.checked = true;
        }
        
        document.getElementById('totalBenefits').value = contract.totalBenefits || '';
        document.getElementById('discountAmount').value = contract.discountAmount || '';
        document.getElementById('totalWithDiscount').value = contract.totalWithDiscount || '';
        document.getElementById('monthlyContractValue').value = contract.monthlyContractValue || '';
        document.getElementById('discountDescription').value = contract.discountDescription || '';
        
        // Rolar para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Mostrar mensagem
        showNotification('Contrato carregado para edição', 'info');
    }, 100);
}

function closeContractModal() {
    const modal = document.querySelector('.contract-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function showNotification(message, type = 'info') {
    // Criar container de notificações se não existir
    let container = document.getElementById('notificationsContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationsContainer';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    }[type] || 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function exportHistory() {
    const contracts = ContractDatabase.getAllContracts();
    const contractsList = Object.values(contracts);
    
    if (contractsList.length === 0) {
        showNotification('Nenhum contrato para exportar', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(contractsList, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `contratos_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Histórico exportado com sucesso!', 'success');
}
