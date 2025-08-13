# Documento de Requisitos de Produto (PRD) – Formulário de Inscrição "Quintal das Artes"

**Versão:** 1.0
**Data:** 13 de agosto de 2025
**Elaborado por:** André

## 1. Introdução

### 1.1. Propósito

Este Documento de Requisitos de Produto (PRD) descreve o formulário de inscrição online do "Quintal das Artes". Ele detalha o escopo, as funcionalidades, o fluxo do usuário e os requisitos técnicos para a construção e operação do sistema, visando formalizar o processo de matrícula de alunos na escola.

### 1.2. Público-alvo

*   **Usuários Finais:** Responsáveis (pais, mães ou guardiões) que desejam inscrever crianças nos cursos e contraturnos do Quintal das Artes.
*   **Administração Quintal das Artes:** Equipe responsável por gerenciar as inscrições, dados dos alunos e pagamentos.

### 1.3. Objetivos

*   Simplificar o processo de inscrição para os responsáveis.
*   Coletar de forma eficiente todas as informações necessárias sobre o aprendiz e o responsável.
*   Fornecer clareza sobre os cursos, planos de pagamento, descontos e termos da escola.
*   Integrar-se com sistemas de validação de dados (CPF) e processamento de pagamentos.
*   Reduzir a carga administrativa manual da equipe do Quintal das Artes.

## 2. Visão Geral do Produto

O Formulário de Inscrição "Quintal das Artes" é uma aplicação web de página única (SPA) que guia o usuário através de um processo de registro dividido em duas etapas principais, culminando em uma tela de sucesso com um link para pagamento externo. Ele foi projetado para ser intuitivo e fornecer todas as informações relevantes de forma clara, utilizando dados dinâmicos de cursos e preços.

## 3. Fluxo do Usuário

### O fluxo de inscrição é linear, guiando o usuário passo a passo:

| 1.  **Acesso ao Formulário:** O usuário acessa o formulário via URL, que pode conter parâmetros de pré-preenchimento (e-mail, nome, telefone, forma de pagamento). |
|---|


2.  **Etapa 1: Dados Pessoais e Seleção de Curso/Plano:**
    *   O usuário preenche os dados do aprendiz, do responsável e informações de saúde/emergência.
    *   Seleciona como soube do Quintal das Artes.
    *   Escolhe o curso/modalidade, o plano de pagamento e o desconto aplicável.
    *   O valor a pagar é calculado e exibido dinamicamente.
    *   Seleciona a forma de pagamento e, se aplicável (PIX/Boleto), o dia de vencimento.
    *   Ao clicar em "Continuar", o formulário valida os campos obrigatórios e realiza uma validação externa do CPF.
3.  **Etapa 2: Termos e Condições:**
    *   Após validação da Etapa 1, o usuário é direcionado para a Etapa 2.
    *   São exibidos os Termos e Condições do Quintal das Artes.
    *   O usuário deve aceitar os termos e selecionar uma opção para a autorização de uso de imagem.
    *   Ao clicar em "Enviar Cadastro", o formulário valida os campos obrigatórios da Etapa 2 e submete todos os dados para um webhook externo.
4.  **Etapa Final: Confirmação e Pagamento:**
    *   Após a submissão bem-sucedida, o usuário é direcionado para uma tela de sucesso.
    *   Esta tela informa que a inscrição está quase completa e que o link de pagamento será enviado por e-mail e também está disponível na tela.
    *   Um botão "Ir para o pagamento agora" redireciona o usuário para o link de pagamento externo fornecido pelo webhook.

## 4. Requisitos Funcionais

### 4.1. RF.1 - Inscrição Multi-etapas

O formulário deve ser dividido em duas etapas distintas para melhorar a experiência do usuário e gerenciar a complexidade das informações.

*   **RF.1.1 - Etapa 1: Dados Pessoais e Curso**
    *   **RF.1.1.1 - Campos de Informação do Aprendiz:**
        *   Nome completo do(a) aprendiz (texto, obrigatório)
        *   Em qual escola estuda? (texto, opcional)
        *   Qual a data de nascimento? (data, obrigatório)
    *   **RF.1.1.2 - Campos de Informação do Responsável:**
        *   Qual o nome do(a) responsável? (texto, obrigatório)
        *   Qual o CPF do(a) responsável? (texto com máscara "000.000.000-00", obrigatório, validação externa)
        *   Qual o telefone de contato? (texto com máscara "(00) 00000-0000", obrigatório)
        *   E-mail (e-mail, obrigatório)
        *   Qual o endereço? (área de texto, opcional)
        *   Qual o nome do(a) segundo(a) responsável? (texto, opcional)
        *   Qual o telefone de contato do segundo responsável? (texto com máscara "(00) 00000-0000", opcional)
    *   **RF.1.1.3 - Campos de Informação de Saúde/Emergência:**
        *   Gostaríamos de saber se a criança tem alguma restrição alimentar. Se sim, qual? (área de texto, obrigatório)
        *   Gostaríamos de saber se a criança tem alguma questão de saúde. Se sim, qual? (área de texto, obrigatório)
        *   Em caso de emergência, quem devemos chamar? (área de texto, obrigatório)
    *   **RF.1.1.4 - Campo "Como ficou sabendo":**
        *   Conjunto de checkboxes para seleção múltipla (Instagram, Amigos, Na escola, Casa Lebre, Flyer, Eventos no Quintal, Passei em frente). Pelo menos uma opção deve ser selecionada (obrigatório).
    *   **RF.1.1.5 - Seleção de Curso/Modalidade:**
        *   Dropdown populado dinamicamente com opções de cursos e contraturnos (`precos.json`). (obrigatório)
    *   **RF.1.1.6 - Seleção de Plano de Pagamento:**
        *   Dropdown populado dinamicamente com opções de planos (Mensal, Bimestral, Quadrimestral) (`precos.json`). (obrigatório)
    *   **RF.1.1.7 - Seleção de Desconto:**
        *   Dropdown populado dinamicamente com opções de desconto (`precos.json`). (opcional)
        *   Deve exibir aviso de que descontos não são cumulativos.
    *   **RF.1.1.8 - Cálculo e Exibição de Preço:**
        *   Um campo na tela deve exibir o preço total calculado com base no curso, plano e desconto selecionados.
        *   Se a forma de pagamento for "Cartão de Crédito", o preço exibido deve incluir uma taxa de processamento de 3,99% + R$ 0,49.
        *   Um campo oculto (`valor_calculado`) deve armazenar o valor final.
        *   Um campo oculto (`quantidade_parcelas`) deve armazenar a quantidade de parcelas do plano selecionado.
    *   **RF.1.1.9 - Seleção de Forma de Pagamento:**
        *   Dropdown com opções: "PIX/Boleto", "Cartão de Crédito", "Bolsista Integral". (obrigatório)
        *   A opção "Cartão de Crédito" deve ser dinamicamente habilitada/desabilitada com base no plano selecionado (atualmente, código permite para planos mensais, bimestrais e quadrimestrais, enquanto o HTML sugere apenas bimestral e quadrimestral).
    *   **RF.1.1.10 - Seleção de Dia de Vencimento:**
        *   Dropdown com opções "Dia 5", "Dia 10", "Dia 15". (obrigatório)
        *   Este campo deve ser visível e obrigatório apenas se a forma de pagamento selecionada for "PIX/Boleto".

*   **RF.1.2 - Etapa 2: Termos e Condições**
    *   **RF.1.2.1 - Exibição de Termos de Acordo:**
        *   Apresentar o texto completo dos termos e condições do Quintal das Artes.
    *   **RF.1.2.2 - Checkbox de Aceite de Termos:**
        *   Checkbox "Eu li e concordo com os termos e condições". (obrigatório para continuar)
    *   **RF.1.2.3 - Radio buttons para Autorização de Uso de Imagem:**
        *   Duas opções: "Sim, autorizo..." e "Não, não autorizo...". (obrigatório selecionar uma)

*   **RF.1.3 - Etapa Final: Confirmação e Pagamento**
    *   **RF.1.3.1 - Mensagem de Confirmação:**
        *   Exibir uma mensagem clara de que a inscrição está quase completa e o pagamento finaliza o processo.
    *   **RF.1.3.2 - Botão de Redirecionamento para Pagamento Externo:**
        *   Um botão "Ir para o pagamento agora" que redireciona o usuário para um link de pagamento externo recebido do backend.

### 4.2. RF.2 - Validação de Dados

O formulário deve garantir a integridade e completude dos dados submetidos.

*   **RF.2.1 - Validação de Campos Obrigatórios (Frontend):**
    *   Todos os campos marcados com `required` no HTML devem ser preenchidos antes de avançar entre as etapas ou submeter o formulário.
    *   Feedback visual (`input-error`) deve ser fornecido para campos não preenchidos ou inválidos.
*   **RF.2.2 - Validação de CPF via Webhook:**
    *   O CPF do responsável deve ser validado via uma chamada assíncrona a um webhook externo (`https://criadordigital-n8n-webhook.kttqgl.easypanel.host/webhook/8d12535f-d756-4fd5-b57f-040b3a620409`) antes de permitir que o usuário avance para a Etapa 2.
    *   Mensagens de erro claras devem ser exibidas em caso de CPF inválido.
*   **RF.2.3 - Validação de Seleção "Como ficou sabendo":**
    *   Pelo menos um checkbox da seção "Como ficou sabendo" deve ser selecionado.
*   **RF.2.4 - Validação de Aceite de Termos:**
    *   O checkbox "Eu li e concordo com os termos e condições" deve ser marcado antes da submissão final.
*   **RF.2.5 - Validação de Autorização de Imagem:**
    *   Uma das opções de rádio para autorização de uso de imagem deve ser selecionada antes da submissão final.

### 4.3. RF.3 - Integração com Dados de Preço

*   **RF.3.1 - Carregamento Dinâmico de Cursos, Planos e Descontos:**
    *   O formulário deve carregar dinamicamente todas as opções de cursos, contraturnos, planos de pagamento e descontos a partir do arquivo `precos.json`.
    *   Em caso de falha no carregamento, um alerta deve ser exibido ao usuário.

### 4.4. RF.4 - Lógica de Preço e Desconto

*   **RF.4.1 - Cálculo de Preço com Base em Curso, Plano e Desconto:**
    *   O preço base é determinado pela combinação do curso/contraturno e do plano de pagamento selecionados, conforme `precos.json`.
    *   Se um desconto for selecionado, o percentual de desconto correspondente (`percentual` de `precos.json`) deve ser aplicado ao preço base.
*   **RF.4.2 - Aplicação de Taxa para Pagamento com Cartão de Crédito:**
    *   Se a forma de pagamento for "Cartão de Crédito", uma taxa de 3.99% + R$ 0.49 (fixo) deve ser adicionada ao preço final. Um aviso sobre esta taxa deve ser exibido junto ao preço.
*   **RF.4.3 - Armazenamento de Valor Calculado e Quantidade de Parcelas:**
    *   O valor final calculado (com ou sem taxa de cartão) deve ser armazenado no campo oculto `valor_calculado`.
    *   A quantidade de parcelas do plano selecionado deve ser armazenada no campo oculto `quantidade_parcelas`.

### 4.5. RF.5 - Integração de Pagamento

*   **RF.5.1 - Envio de Dados do Formulário para Webhook de Submissão:**
    *   Após a validação da Etapa 2, todos os dados preenchidos no formulário (incluindo os campos ocultos `valor_calculado` e `quantidade_parcelas`, e o campo combinado `curso-plano-completo`) devem ser enviados via POST para um webhook externo (`https://criadordigital-n8n-webhook.kttqgl.easypanel.host/webhook/c51bd45c-c232-44db-8490-f52f22ae34ce`).
*   **RF.5.2 - Recebimento de Link de Pagamento do Webhook:**
    *   O webhook de submissão deve retornar um objeto JSON contendo um campo `link` com a URL de pagamento.
*   **RF.5.3 - Redirecionamento para o Link de Pagamento:**
    *   Se o link for recebido com sucesso, o botão "Ir para o pagamento agora" deve ser ativado para redirecionar o usuário para essa URL em uma nova aba.
    *   Em caso de "Bolsista Integral" como forma de pagamento, a expectativa é que o webhook de submissão do formulário finalize a inscrição sem gerar um link de pagamento, registrando o aluno como bolsista. O frontend apenas envia a informação da forma de pagamento, e o backend é responsável por essa lógica.

### 4.6. RF.6 - Pré-preenchimento de Campos

*   **RF.6.1 - Preenchimento Automático via URL:**
    *   O formulário deve ser capaz de pré-preencher os campos `email`, `nome`, `telefone` e `forma-pagamento` se estes forem passados como parâmetros na URL (ex: `?email=teste@email.com&nome=Nome&telefone=11999999999&forma_pagamento=boleto`).

## 5. Requisitos Não Funcionais

### 5.1. RNF.1 - Usabilidade (UX)

*   **RNF.1.1 - Interface Intuitiva:** Design limpo e fácil de navegar.
*   **RNF.1.2 - Feedback Claro:** Mensagens de erro e sucesso visíveis e compreensíveis.
*   **RNF.1.3 - Máscaras de Entrada:** Campos de telefone e CPF devem ter máscaras para facilitar o preenchimento e garantir o formato correto.
*   **RNF.1.4 - Rolagem para o Topo:** Após a transição entre etapas, a página deve rolar para o topo para garantir que o usuário veja o novo conteúdo.

### 5.2. RNF.2 - Performance

*   **RNF.2.1 - Carregamento Rápido:** O formulário e seus recursos (JS, CSS, JSON) devem carregar rapidamente.
*   **RNF.2.2 - Resposta Rápida das Validações:** As validações locais devem ser instantâneas, e a validação de CPF via webhook deve ter um tempo de resposta aceitável para não impactar a fluidez da navegação.

### 5.3. RNF.3 - Compatibilidade

*   **RNF.3.1 - Responsividade:** O formulário deve ser totalmente responsivo e funcionar bem em diferentes tamanhos de tela (desktop, tablet, mobile).
*   **RNF.3.2 - Compatibilidade com Navegadores:** Compatível com as versões mais recentes dos principais navegadores (Chrome, Firefox, Safari, Edge).

### 5.4. RNF.4 - Segurança

*   **RNF.4.1 - Comunicação Segura:** Todas as chamadas para webhooks devem ser realizadas via HTTPS.
*   **RNF.4.2 - Não Armazenamento de Dados Sensíveis:** O frontend não deve armazenar permanentemente dados sensíveis dos usuários. O processamento e armazenamento devem ocorrer nos sistemas de backend integrados.

### 5.5. RNF.5 - Manutenibilidade

*   **RNF.5.1 - Código Modular:** Estrutura de código HTML, CSS e JavaScript organizada para facilitar futuras manutenções e atualizações.
*   **RNF.5.2 - Dados de Preço Externos:** O uso de um arquivo JSON separado para dados de preço permite atualizações sem a necessidade de modificar o código JavaScript principal.

## 6. Integrações

### O formulário depende das seguintes integrações externas:

| *   **Webhook de Validação de CPF:** |
|---|


    *   **Endpoint:** `https://criadordigital-n8n-webhook.kttqgl.easypanel.host/webhook/8d12535f-d756-4fd5-b57f-040b3a620409`
    *   **Método:** `POST`
    *   **Payload:** `{ "cpf": "cpf_limpo" }`
    *   **Resposta Esperada:** `{ "valido": true/false, "erro": "mensagem de erro" }`
*   **Webhook de Submissão de Formulário:**
    *   **Endpoint:** `https://criadordigital-n8n-webhook.kttqgl.easypanel.host/webhook/c51bd45c-c232-44db-8490-f52f22ae34ce`
    *   **Método:** `POST`
    *   **Payload:** Objeto JSON contendo todos os dados do formulário, incluindo `valor_calculado`, `quantidade_parcelas` e `curso-plano-completo`.
    *   **Resposta Esperada:** `{ "link": "url_de_pagamento" }` (ou sinal de sucesso para bolsistas).

## 7. Considerações Técnicas/Assunções

*   **Tecnologias Frontend:** HTML5, CSS3, JavaScript.
*   **Bibliotecas:** jQuery (v3.6.0) e jQuery Mask (v1.14.16) para manipulação do DOM e máscaras de entrada.
*   **Estrutura de Dados de Preço:** Arquivo `precos.json` local com a estrutura definida para cursos, planos e descontos.
*   **Backend:** Assumimos que os webhooks (N8N ou similar) são responsáveis pela lógica de validação de CPF, processamento dos dados submetidos, geração do link de pagamento (para não-bolsistas) e tratamento dos casos de inscrição de bolsistas.
*   **Sistema de Pagamento:** O formulário não processa pagamentos diretamente; ele redireciona para um sistema de pagamento externo via um link fornecido pelo webhook.

## 8. Próximos Passos e Considerações Futuras

*   **Gerenciamento de Erros:** Melhorar a gestão de erros para cenários onde os webhooks não respondem ou retornam erros inesperados.
*   **Autenticação:** Para uma solução mais robusta, considerar um sistema de autenticação para usuários ou responsáveis.
*   **Persistência de Dados:** Implementar um banco de dados ou integração com um CRM/ERP para armazenar e gerenciar de forma mais eficaz os dados das inscrições, além do registro via webhook.
*   **Personalização de Mensagens:** Possibilidade de personalizar mensagens de sucesso e e-mails de confirmação com base nos dados do usuário.
*   **Otimização de SEO:** Embora seja um formulário interno, caso haja intenção de descoberta, otimização para motores de busca pode ser considerada.
*   **Testes Automatizados:** Implementar testes unitários e de integração para garantir a estabilidade das funcionalidades e validações.

---

Este PRD oferece uma base sólida para o desenvolvimento e aprimoramento do seu formulário, André. Ele pode ser usado para alinhar a equipe de desenvolvimento, planejar futuras funcionalidades e garantir que o produto atenda às necessidades do Quintal das Artes.
