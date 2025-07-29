let dadosPrecos = {};
let checkoutUrl = '';

// ===== FUNÇÃO PARA CALCULAR PREÇO COM TAXA DO CARTÃO =====
function calcularPrecoComTaxa(valorLiquido) {
  const taxaPercentual = 0.0399; // 3,99%
  const taxaFixa = 0.49;         // R\$ 0,49 fixo

  const preco = (valorLiquido + taxaFixa) / (1 - taxaPercentual);
  return parseFloat(preco.toFixed(2)); // retorna como número com 2 casas decimais
}

// ===== FUNÇÃO CORRIGIDA PARA CALCULAR QUANTIDADE DE PARCELAS =====
function calcularQuantidadeParcelas(plano) {
  // Ler do arquivo precos.json carregado
  if (dadosPrecos.planos && dadosPrecos.planos[plano] && dadosPrecos.planos[plano].parcelas) {
    return dadosPrecos.planos[plano].parcelas;
  }
  
  // Fallback caso não encontre no JSON
  console.warn(`Parcelas não encontradas para o plano: ${plano}. Usando valor padrão: 1`);
  return 1;
}

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
    cartaoOption.textContent = '💳 Cartão de Crédito (disponível apenas para planos bimestral e quadrimestral)';
    
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
  const formaPagamento = document.getElementById('forma-pagamento').value;
  
  if (!planoSelecionado || !cursoSelecionado) {
    document.getElementById('preco-container').classList.add('hidden');
    // Limpar aviso de taxa se existir
    const avisoTaxa = document.getElementById('aviso-taxa-cartao');
    if (avisoTaxa) {
      avisoTaxa.remove();
    }
    // Limpar campo de parcelas quando não há seleção
    const campoQuantidadeParcelas = document.getElementById('quantidade_parcelas');
    if (campoQuantidadeParcelas) {
      campoQuantidadeParcelas.value = '';
    }
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
  
  // Aplicar desconto se selecionado
  if (descontoSelecionado && dadosPrecos.descontos[descontoSelecionado]) {
    const desconto = dadosPrecos.descontos[descontoSelecionado];
    preco = preco * (1 - desconto.percentual / 100);
  }
  
  // Verificar se é plano mensal e forma de pagamento é cartão
  const isPlanoMensal = planoSelecionado === 'mensal';
  const isCartaoCredito = formaPagamento === 'cartao-credito';
  let precoFinal = preco;
  let avisoTaxa = '';
  
  if (isCartaoCredito) {
    precoFinal = calcularPrecoComTaxa(preco);
    avisoTaxa = `
      <div id="aviso-taxa-cartao" style="
        background-color: #fff3cd; 
        border: 1px solid #ffeaa7; 
        border-radius: 5px; 
        padding: 10px; 
        margin-top: 10px; 
        font-size: 0.9rem; 
        color: #856404;
      ">
        ⚠️ <strong>Atenção:</strong> Para planos pagos no cartão de crédito, há um acréscimo de taxa de processamento de 3,99% + R\$ 0,49.
        <br>
        <small>Valor original: R\$ ${preco.toFixed(2).replace('.', ',')} | Valor com taxa: R\$ ${precoFinal.toFixed(2).replace('.', ',')}</small>
      </div>
    `;
  }

  // Atualizar o campo oculto com o valor final
  document.getElementById('valor_calculado').value = precoFinal.toFixed(2);
  
  // ===== ATUALIZAR CAMPO OCULTO COM QUANTIDADE DE PARCELAS =====
  const quantidadeParcelas = calcularQuantidadeParcelas(planoSelecionado);
  const campoQuantidadeParcelas = document.getElementById('quantidade_parcelas');
  if (campoQuantidadeParcelas) {
    campoQuantidadeParcelas.value = quantidadeParcelas;
    console.log(`Quantidade de parcelas definida: ${quantidadeParcelas} para o plano: ${planoSelecionado}`); // Debug
  } else {
    console.error('Campo quantidade_parcelas não encontrado no HTML!');
  }

  const precoDisplay = document.getElementById('preco-display');
  const planoInfo = dadosPrecos.planos[planoSelecionado];
  
  precoDisplay.innerHTML = `
    <div><strong>${curso.nome}</strong></div>
    <div>${planoInfo.nome}</div>
    <div style="font-size: 1.4rem; color: #FAC622;">R\$ ${precoFinal.toFixed(2).replace('.', ',')}/mês</div>
    ${descontoSelecionado ? `<div style="font-size: 0.9rem; color: #27ae60;">✓ ${dadosPrecos.descontos[descontoSelecionado].nome} aplicado</div>` : ''}
    ${avisoTaxa}
  `;
  
  document.getElementById('preco-container').classList.remove('hidden');
}

// ===== FUNÇÃO PARA OBTER CURSO + PLANO COMBINADOS =====
function getCursoPlanoCompleto() {
  const cursoSelecionado = document.getElementById('curso').value;
  const planoSelecionado = document.getElementById('plano').value;
  
  if (!cursoSelecionado || !planoSelecionado) {
    return '';
  }
  
  // Buscar o nome do curso
  let nomeCurso = '';
  if (dadosPrecos.cursos && dadosPrecos.cursos[cursoSelecionado]) {
    nomeCurso = dadosPrecos.cursos[cursoSelecionado].nome;
  } else if (dadosPrecos.contraturnos && dadosPrecos.contraturnos[cursoSelecionado]) {
    nomeCurso = dadosPrecos.contraturnos[cursoSelecionado].nome;
  }
  
  // Buscar o nome do plano
  let nomePlano = '';
  if (dadosPrecos.planos && dadosPrecos.planos[planoSelecionado]) {
    nomePlano = dadosPrecos.planos[planoSelecionado].nome;
  }
  
  // Retornar combinação
  if (nomeCurso && nomePlano) {
    return `${nomeCurso} - ${nomePlano}`;
  }
  
  return '';
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

// ===== ENVIO DO FORMULÁRIO MODIFICADO =====
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
    
    // ===== ADICIONAR CAMPO COMBINADO ANTES DO ENVIO =====
    const cursoPlanoCompleto = getCursoPlanoCompleto();
    if (cursoPlanoCompleto) {
      // Verificar se já existe um campo com esse nome (evitar duplicatas)
      const campoExistente = step1Form.querySelector('input[name="curso-plano-completo"]');
      if (campoExistente) {
        campoExistente.remove();
      }
      
      // Criar e adicionar o campo hidden
      const campoHidden = document.createElement('input');
      campoHidden.type = 'hidden';
      campoHidden.name = 'curso-plano-completo';
      campoHidden.value = cursoPlanoCompleto;
      
      step1Form.appendChild(campoHidden);
      
      console.log('Campo combinado adicionado:', cursoPlanoCompleto); // Para debug
    }
    
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

    // ===== DEBUG PARA VERIFICAR SE O CAMPO PARCELAS ESTÁ SENDO ENVIADO =====
    console.log('Payload final completo:', payload);
    console.log('Campo quantidade_parcelas no payload:', payload['quantidade_parcelas']);

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
  // Event listener para forma de pagamento
  document.getElementById('forma-pagamento').addEventListener('change', calcularPreco);
  
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
