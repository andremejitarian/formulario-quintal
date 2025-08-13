# Documento de Requisitos de Produto (PRD) – Formulário de Inscrição "Quintal das Artes"

## 3. Fluxo do Usuário

### Diagrama de Fluxo do Usuário

```mermaid
graph TD
    A(Início: Acesso ao Formulário) --> B[Etapa 1: Dados Pessoais e Seleção de Curso/Plano];

    subgraph Validação da Etapa 1
        B -- Preenchimento e Seleção --> C{Validar Campos Obrigatórios e CPF?};
        C -- Não (Dados Incompletos/Inválidos) --> B;
    end

    C -- Sim (Validado) --> D[Etapa 2: Termos e Condições];

    subgraph Validação da Etapa 2
        D -- Aceite de Termos e Autorização de Imagem --> E{Validar Aceite e Autorização?};
        E -- Não (Não Aceito/Selecionado) --> D;
    end

    E -- Sim (Enviar Cadastro) --> F[Etapa Final: Confirmação e Pagamento];
    F -- "Clicar em 'Ir para o pagamento agora'" --> G(Redirecionar para Pagamento Externo);
