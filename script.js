let dadosPrecos = {};
let checkoutUrl = '';

// ===== CARREGAMENTO DE DADOS =====
async function carregarPrecos() {
  try {
    const response = await fetch('./precos.json');
    dadosPrecos = await response.json();
    console.log('Dados carregados:', dadosPrecos);
    preencherCursos();
    preencherPlanos();
    preencherDescontos();
  } catch (error) {
    console.error('Erro ao carregar preços:', error);
    alert('Erro ao carregar dados de preços. Tente novamente.');
  }
}

function preencherCursos() {
  const cursoSelect = document.getElementById('curso');
  cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
  
  if (dadosPrecos.cursos) {
    Object.entries(dadosPrecos.cursos).forEach(([key, curso]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = curso.nome;
      cursoSelect.appendChild(option);
    });
  }
  
  if (dadosPrecos.contraturnos) {
    Object.entries(dadosPrecos.contraturnos).forEach(([key, contraturno]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = contraturno.nome;
      cursoSelect.appendChild(option);
    });
  }
}

function preencherPlanos() {
  const planoSelect = document.getElementById('plano');
  planoSelect.innerHTML = '<option value="">Selecione um plano</option>';
  
  if (dadosPrecos.planos) {
    Object.entries(dadosPrecos.planos).forEach(([key, plano]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = plano.nome;
      planoSelect.appendChild(option);
    });
  }
}

function preencherDescontos() {
  const descontoSelect = document.getElementById('desconto');
  descontoSelect.innerHTML = '<option value="">Nenhum desconto</option>';
  
  if (dadosPrecos.descontos) {
    Object.entries(dadosPrecos.descontos).forEach(([key, desconto]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = `${desconto.nome} (${desconto.percentual}% desconto)`;
      descontoSelect.appendChild(option);
    });
  }
}

// ===== LÓGICA DE PAGAMENTO =====
function atualizarFormaPagamento() {
  const planoSelecionado = document.getElementById('plano').value;
  const formaPagamentoSelect = document.getElementById('forma-pagamento');
  const paymentInfo = document.getElementById('payment-info');
  const cartaoOption = formaPagamentoSelect.querySelector('option[value="cartao-credito"]');
  
  const permiteCartao = planoSelecionado === 'mensal' || planoSelecionado === 'bimestral' || planoSelecionado === 'quadrimestral';
  
  if (permiteCartao) {
    cartaoOption.disabled = false;
    cartaoOption.textContent = '💳 Cartão de Crédito';
    paymentInfo.classList.add('hidden');
  } else {
    cartaoOption.disabled = true;
    cartaoOption.textContent = '�� Cartão de Crédito (disponível apenas para planos bimestral e quadrimestral)';
    
    if (formaPagamentoSelect.value === 'cartao-credito') {
      formaPagamentoSelect.value = '';
    }
    
    if (planoSelecionado) {
      paymentInfo.classList.remove('hidden');
    }
  }
}

function calcularPreco() {
  const planoSelecionado = document.getElementById('plano').value;
  const cursoSelecionado = document.getElementById('curso').value;
  const descontoSelecionado = document.getElementById('desconto').value;
  
  if (!planoSelecionado || !cursoSelecionado) {
    document.getElementById('preco-container').classList.add('hidden');
    return;
  }
  
  let curso = dadosPrecos.cursos[cursoSelecionado] || dadosPrecos.contraturnos[cursoSelecionado];
  if (!curso) {
    console.error('Curso não encontrado:', cursoSelecionado);
    return;
  }
  
  let preco = curso.precos[planoSelecionado];
  if (!preco) {
    console.error('Preço não encontrado para plano:', planoSelecionado);
    return;
  }
  
  if (descontoSelecionado && dadosPrecos.descontos[descontoSelecionado]) {
    const desconto = dadosPrecos.descontos[descontoSelecionado];
    preco = preco * (1 - desconto.percentual / 100);
  }
  
// 🟨 ATUALIZA O CAMPO OCULTO COM O VALOR FINAL
  document.getElementById('valor_calculado').value = preco.toFixed(2);

  const precoDisplay = document.getElementById('preco-display');
  const planoInfo = dadosPrecos.planos[planoSelecionado];
  
  precoDisplay.innerHTML = `
    <div><strong>${curso.nome}</strong></div>
    <div>${planoInfo.nome}</div>
    <div style="font-size: 1.4rem; color: #FAC622;">R\$ ${preco.toFixed(2).replace('.', ',')}/mês</div>
    ${descontoSelecionado ? `<div style="font-size: 0.9rem; color: #27ae60;">✓ ${dadosPrecos.descontos[descontoSelecionado].nome} aplicado</div>` : ''}
  `;
  
  document.getElementById('preco-container').classList.remove('hidden');
}

// ===== VALIDAÇÃO DE CPF CORRIGIDA =====
async function validarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) {
    return { valido: false, erro: 'CPF deve ter 11 dígitos' };
  }

  try {
    const validationWebhookUrl = 'https://criadordigital-n8n-webhook.kttqgl.easypanel.host/webhook/8d12535f-d756-4fd5-b57f-040b3a620409';

    const response = await fetch(validationWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: cpfLimpo })
    });

    if (!response.ok) {
      return { valido: false, erro: 'Erro na validação do CPF. Tente novamente.' };
    }

    const responseData = await response.json();
    console.log('Resposta do webhook CPF:', responseData); // Debug

    // Suporte para array ou objeto simples
    const data = Array.isArray(responseData) ? responseData[0] : responseData;

    if (data && typeof data.valido === 'boolean') {
      return {
        valido: data.valido === true,
        erro: data.valido === true ? null : 'CPF inválido. Por favor, verifique e tente novamente.'
      };
    } else {
      console.error('Formato de resposta inesperado:', responseData);
      return { valido: false, erro: 'Erro na validação do CPF. Tente novamente.' };
    }

  } catch (error) {
    console.error('Erro na validação do CPF:', error);
    return { valido: false, erro: 'Erro de conexão. Tente novamente.' };
  }
}


// ===== VALIDAÇÕES =====
function validarFonteConhecimento() {
  const checkboxes = document.querySelectorAll('input[name="fonte-conhecimento"]:checked');
  const erro = document.getElementById('fonte-error');
  
  if (checkboxes.length === 0) {
    erro.classList.remove('hidden');
    return false;
  } else {
    erro.classList.add('hidden');
    return true;
  }
}

function validarPrimeiraEtapa() {
  const form = document.getElementById('step-1-form');
  const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valido = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('input-error');
      valido = false;
    } else {
      input.classList.remove('input-error');
    }
  });
  
  if (!validarFonteConhecimento()) {
    valido = false;
  }
  
  return valido;
}

function validarSegundaEtapa() {
  let valido = true;
  
  const aceitoTermos = document.getElementById('aceito-termos');
  const termosError = document.getElementById('termos-error');
  
  if (!aceitoTermos.checked) {
    termosError.classList.remove('hidden');
    valido = false;
  } else {
    termosError.classList.add('hidden');
  }
  
  const autorizacaoImagem = document.querySelector('input[name="autorizacao-imagem"]:checked');
  const autorizacaoError = document.getElementById('autorizacao-error');
  
  if (!autorizacaoImagem) {
    autorizacaoError.classList.remove('hidden');
    valido = false;
  } else {
    autorizacaoError.classList.add('hidden');
  }
  
  return valido;
}

// ===== NAVEGAÇÃO ATUALIZADA =====
async function irParaSegundaTela() {
  // Primeiro valida os campos obrigatórios
  if (!validarPrimeiraEtapa()) {
    alert('Por favor, preencha todos os campos obrigatórios antes de continuar.');
    return;
  }

  const btnContinuar = document.getElementById('btn-next-step');
  const cpfInput = document.getElementById('cpf-responsavel');
  const cpfError = document.getElementById('cpf-error');
  
  // Desabilita o botão e mostra loading
  btnContinuar.disabled = true;
  btnContinuar.textContent = 'Validando CPF...';
  
  // Limpa erros anteriores
  cpfError.classList.add('hidden');
  cpfInput.classList.remove('input-error');
  
  // Valida o CPF
  const resultadoValidacao = await validarCPF(cpfInput.value);
  
  if (resultadoValidacao.valido) {
    // CPF válido - avança para próxima tela
    document.getElementById('form-step-1').classList.add('hidden');
    document.getElementById('form-step-2').classList.remove('hidden');
    window.scrollTo(0, 0);
  } else {
    // CPF inválido - mostra erro
    cpfError.textContent = resultadoValidacao.erro;
    cpfError.classList.remove('hidden');
    cpfInput.classList.add('input-error');
    cpfInput.focus();
  }
  
  // Restaura o botão
  btnContinuar.disabled = false;
  btnContinuar.textContent = 'Continuar para Termos e Condições';
}

function voltarParaPrimeiraTela() {
  document.getElementById('form-step-2').classList.add('hidden');
  document.getElementById('form-step-1').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// ===== UTILITÁRIOS =====
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  let value = urlParams.get(name);
  
  if (value && (value.startsWith('"') && value.endsWith('"'))) {
    value = value.slice(1, -1);
  }
  
  return value;
}

function preencherCampos() {
  const emailParam = getUrlParameter('email');
  if (emailParam) {
    document.getElementById('email').value = emailParam;
  }
  
  const nomeParam = getUrlParameter('nome');
  if (nomeParam) {
    document.getElementById('nome').value = nomeParam;
  }
  
  const telefoneParam = getUrlParameter('telefone');
  if (telefoneParam) {
    document.getElementById('telefone').value = telefoneParam;
  }
  
  const formaPagamentoParam = getUrlParameter('forma_pagamento');
  if (formaPagamentoParam) {
    document.getElementById('forma-pagamento').value = formaPagamentoParam;
  }
}

// ===== ENVIO DO FORMULÁRIO SIMPLIFICADO =====
async function enviarFormulario(event) {
  event.preventDefault();

  if (!validarSegundaEtapa()) {
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  const step2Container = document.getElementById('form-step-2');
  const successMessage = document.getElementById('success-message');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    const submissionWebhookUrl = 'https://criadordigital-n8n-webhook.kttqgl.easypanel.host/webhook/c51bd45c-c232-44db-8490-f52f22ae34ce';
    
    const step1Form = document.getElementById('step-1-form');
    const step2Form = document.getElementById('step-2-form');
    const formData1 = new FormData(step1Form);
    const formData2 = new FormData(step2Form);
    const payload = {};
    
    // Processar dados da primeira etapa
    for (let [key, value] of formData1.entries()) {
      if (key !== 'fonte-conhecimento') {
        payload[key] = value;
      }
    }
    
    // Processar dados da segunda etapa
    for (let [key, value] of formData2.entries()) {
      payload[key] = value;
    }
    
    // Processar checkboxes de fonte de conhecimento
    const fontesConhecimento = [];
    document.querySelectorAll('input[name="fonte-conhecimento"]:checked').forEach(checkbox => {
      fontesConhecimento.push(checkbox.value);
    });
    payload['fonte-conhecimento'] = fontesConhecimento.join(', ');

    const submissionResp = await fetch(submissionWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const submissionData = await submissionResp.json();
    if (!submissionData.link) throw new Error('Link de pagamento não encontrado.');

    checkoutUrl = submissionData.link;
    step2Container.classList.add('hidden');
    successMessage.classList.remove('hidden');
    window.scrollTo(0, 0);
  } catch (error) {
    console.error('Erro:', error.message);
    alert('Erro ao enviar. Tente novamente.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Cadastro';
  }
}

function irParaPagamento() {
  if (checkoutUrl) {
    window.open(checkoutUrl, '_blank');
  } else {
    alert('Link de pagamento não disponível.');
  }
}

// ===== INICIALIZAÇÃO =====
$(document).ready(function () {
  console.log('jQuery carregado, aplicando máscaras...');
  
  // Máscaras
  $('#telefone').mask('(00) 00000-0000');
  $('#telefone-segundo').mask('(00) 00000-0000');
  $('#cpf-responsavel').mask('000.000.000-00', { reverse: true });
  
  console.log('Máscaras aplicadas, carregando preços...');
  
  // Event listeners
  document.getElementById('curso').addEventListener('change', calcularPreco);
  document.getElementById('plano').addEventListener('change', function() {
    atualizarFormaPagamento();
    calcularPreco();
  });
  document.getElementById('desconto').addEventListener('change', calcularPreco);
  document.getElementById('btn-next-step').addEventListener('click', irParaSegundaTela);
  document.getElementById('btn-back-step').addEventListener('click', voltarParaPrimeiraTela);
  document.getElementById('step-2-form').addEventListener('submit', enviarFormulario);
  document.getElementById('btn-ir-pagamento').addEventListener('click', irParaPagamento);
  
  // Carregar dados
  carregarPrecos().then(() => {
    console.log('Preços carregados, preenchendo campos...');
    preencherCampos();
  });
});
