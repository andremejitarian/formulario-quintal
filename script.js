document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('estadiaForm');
    
    // URLs das webhooks
    const WEBHOOK_URL = 'https://criadordigital-n8n-editor.kttqgl.easypanel.host/webhook-test/91479e0c-d686-42dd-a381-c3e44d50df7e';
    const CPF_VALIDATION_URL = 'https://criadordigital-n8n-webhook.kttqgl.easypanel.host/webhook/c4d1f0e8-90d5-4092-9f6c-ef116fe81e8a';

    // Função para mostrar a tela do formulário
    window.showFormScreen = function() {
        document.getElementById('welcomeScreen').classList.remove('active');
        document.getElementById('formScreen').classList.add('active');
    }

    // Função para mostrar a tela de boas-vindas
    window.showWelcomeScreen = function() {
        document.getElementById('formScreen').classList.remove('active');
        document.getElementById('welcomeScreen').classList.add('active');
    }

    // ===== MÁSCARAS DE FORMATAÇÃO =====
    
    // Máscara para CPF
    document.getElementById('cpf').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });

    // Máscara para Celular
    document.getElementById('celular').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
    });

    // Máscara para Valor (Moeda)
    document.getElementById('valor').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (!value) {
            e.target.value = '';
            return;
        }
        value = (parseInt(value) / 100).toFixed(2);
        value = value.replace('.', ',');
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        e.target.value = 'R\$ ' + value;
    });

    document.getElementById('valor').addEventListener('blur', function(e) {
        let value = e.target.value;
        if (value && !value.startsWith('R\$ ')) {
            let numericValue = value.replace(/\D/g, '');
            if (numericValue) {
                numericValue = (parseInt(numericValue) / 100).toFixed(2);
                numericValue = numericValue.replace('.', ',');
                numericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                e.target.value = 'R\$ ' + numericValue;
            }
        }
    });

    // ===== VALIDAÇÕES =====

    // Validação de CPF local (matemática)
    function validarCPFLocal(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    // Validação de CPF via webhook (baseada no seu código funcional)
    async function validarCPF(cpf) {
        try {
            const cpfLimpo = cpf.replace(/[^\d]/g, '');
            console.log('🔍 Validando CPF via webhook:', cpfLimpo);
            
            const response = await fetch(CPF_VALIDATION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    cpf: cpfLimpo
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('📋 Resposta completa da validação CPF:', responseData);

            // Trata a resposta: [{"cpf": "37253211839", "valido": "true"}]
            if (Array.isArray(responseData) && responseData.length > 0) {
                const resultado = responseData[0];
                const valido = resultado.valido === "true" || resultado.valido === true;
                
                console.log(`✅ CPF ${resultado.cpf} - Válido: ${valido}`);
                
                return {
                    valido: valido,
                    erro: valido ? null : 'CPF inválido ou não encontrado'
                };
            }

            return {
                valido: false,
                erro: 'Erro na validação do CPF'
            };

        } catch (error) {
            console.error('❌ Erro na validação do CPF via webhook:', error);
            console.log('🔄 Usando validação local como fallback');
            
            const cpfValidoLocal = validarCPFLocal(cpf);
            return {
                valido: cpfValidoLocal,
                erro: cpfValidoLocal ? null : 'CPF inválido (validação local)'
            };
        }
    }

    // ===== FUNÇÕES AUXILIARES =====

    function converterValorParaNumero(valorFormatado) {
        if (!valorFormatado) return 0;
        let valor = valorFormatado.replace(/R\$\s?/g, '').replace(/\./g, '');
        valor = valor.replace(',', '.');
        return parseFloat(valor) || 0;
    }

    function mostrarMensagem(texto, tipo = 'sucesso') {
        const mensagemExistente = document.querySelector('.mensagem-feedback');
        if (mensagemExistente) {
            mensagemExistente.remove();
        }

        const mensagem = document.createElement('div');
        mensagem.className = `mensagem-feedback ${tipo}`;
        mensagem.innerHTML = `
            <div class="mensagem-conteudo">
                <span class="mensagem-icone">${tipo === 'sucesso' ? '✅' : '❌'}</span>
                <span class="mensagem-texto">${texto}</span>
            </div>
        `;

        document.body.appendChild(mensagem);

        setTimeout(() => {
            if (mensagem.parentNode) {
                mensagem.style.opacity = '0';
                setTimeout(() => mensagem.remove(), 300);
            }
        }, 5000);
    }

    async function enviarParaN8N(dadosFormulario) {
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...dadosFormulario,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        source: 'formulario-check-in-fazenda',
                        userAgent: navigator.userAgent,
                        url: window.location.href
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                responseData = await response.text();
            }

            console.log('✅ Sucesso - Resposta do n8n:', responseData);
            return { success: true, data: responseData };

        } catch (error) {
            console.error('❌ Erro ao enviar para n8n:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== MANIPULADOR DO FORMULÁRIO =====
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = document.querySelector('.submit-button');
        const textoOriginal = submitButton.innerHTML;
        
        // Ativa o loading
        submitButton.innerHTML = '<span class="loading-spinner"></span> Validando CPF...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';

        // Coleta os dados do formulário
        const formData = {
            nomeCompleto: document.getElementById('nomeCompleto').value.trim(),
            cpf: document.getElementById('cpf').value,
            cpfLimpo: document.getElementById('cpf').value.replace(/[^\d]/g, ''),
            email: document.getElementById('email').value.trim().toLowerCase(),
            celular: document.getElementById('celular').value,
            celularLimpo: document.getElementById('celular').value.replace(/[^\d]/g, ''),
            nomeEvento: document.getElementById('nomeEvento').value.trim(),
            valor: document.getElementById('valor').value,
            valorNumerico: converterValorParaNumero(document.getElementById('valor').value),
            dataChegada: document.getElementById('dataChegada').value,
            dataSaida: document.getElementById('dataSaida').value,
            aceitoRegulamento: document.getElementById('aceitoRegulamento').checked,
            comunicacoesFazenda: document.querySelector('input[name="comunicacoesFazenda"]:checked') ? 
                document.querySelector('input[name="comunicacoesFazenda"]:checked').value : 'não informado'
        };

        function restaurarBotao() {
            submitButton.innerHTML = textoOriginal;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }

        // Validação do regulamento
        if (!formData.aceitoRegulamento) {
            restaurarBotao();
            mostrarMensagem('Você deve aceitar o Regulamento Interno para prosseguir.', 'erro');
            return;
        }

        // Validação do CPF via webhook (usando seu padrão)
        console.log('🔍 Iniciando validação do CPF...');
        const resultadoValidacao = await validarCPF(formData.cpf);
        
        if (resultadoValidacao.valido) {
            console.log('✅ CPF validado com sucesso via webhook!');
            submitButton.innerHTML = '<span class="loading-spinner"></span> Enviando dados...';
        } else {
            restaurarBotao();
            mostrarMensagem(resultadoValidacao.erro || 'CPF inválido. Por favor, verifique e digite um CPF válido.', 'erro');
            return;
        }

        // Demais validações
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            restaurarBotao();
            mostrarMensagem('Por favor, insira um email válido.', 'erro');
            return;
        }

        if (formData.celularLimpo.length < 10) {
            restaurarBotao();
            mostrarMensagem('Por favor, insira um número de celular válido.', 'erro');
            return;
        }

        if (formData.nomeEvento.length < 3) {
            restaurarBotao();
            mostrarMensagem('O nome do evento deve ter pelo menos 3 caracteres.', 'erro');
            return;
        }

        if (formData.valorNumerico <= 0) {
            restaurarBotao();
            mostrarMensagem('Por favor, insira um valor válido maior que zero.', 'erro');
            return;
        }

        // Validação de datas
        const hoje = new Date();
        const chegada = new Date(formData.dataChegada);
        const saida = new Date(formData.dataSaida);
        const dataLimite = new Date();
        dataLimite.setDate(hoje.getDate() - 60);
        dataLimite.setHours(0, 0, 0, 0);

        const chegadaNormalizada = new Date(chegada);
        chegadaNormalizada.setHours(0, 0, 0, 0);
        const saidaNormalizada = new Date(saida);
        saidaNormalizada.setHours(0, 0, 0, 0);

        if (chegadaNormalizada < dataLimite) {
            restaurarBotao();
            mostrarMensagem('A data de chegada não pode ser anterior a 60 dias da data atual.', 'erro');
            return;
        }

        if (saidaNormalizada <= chegadaNormalizada) {
            restaurarBotao();
            mostrarMensagem('A data de saída deve ser posterior à data de chegada.', 'erro');
            return;
        }

        // Envio para N8N
        console.log('📤 Enviando dados para n8n...', formData);
        const resultado = await enviarParaN8N(formData);

        if (resultado.success) {
            restaurarBotao();
            mostrarMensagem('✅ Check-in realizado com sucesso! Dados enviados para processamento.');
            setTimeout(() => {
                form.reset();
                showWelcomeScreen();
            }, 3000);
        } else {
            restaurarBotao();
            mostrarMensagem(`❌ Erro ao processar check-in: ${resultado.error}. Tente novamente.`, 'erro');
        }
    });
});
