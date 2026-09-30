import { Phase } from '../types';

export const CURRICULUM: Phase[] = [
  {
    id: 'phase-1',
    name: 'Ferramentas e Memória',
    objective: 'Dominar as ferramentas fundamentais de IA e sistemas de memória para construir aplicações práticas',
    weekRange: [1, 2],
    color: '#0066cc',
    concepts: [
      {
        id: 'phase-1-concept-1',
        title: 'Fundamentos de LLMs e Engenharia de Prompts',
        whyItMatters: 'Entender como os LLMs funcionam e como formular prompts eficazes é a base de toda aplicação de IA. Sem esse conhecimento, você estará adivinhando em vez de projetando.',
        whatToLearn: 'Arquitetura Transformer, tokens e contexto, técnicas de prompt engineering (zero-shot, few-shot, chain-of-thought), limitações e comportamentos dos modelos.',
        howToLearn: 'Pratique com a API do Claude diretamente. Crie prompts para tarefas específicas e observe como pequenas mudanças afetam os resultados. Documente padrões que funcionam.',
        resources: [
          'Anthropic Prompt Engineering Guide (docs.anthropic.com)',
          'Paper: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (Wei et al., 2022)',
          'Curso: Prompt Engineering for Developers (DeepLearning.AI)',
        ],
        pitfalls: [
          'Não testar prompts com variações de entrada — um prompt que funciona num caso pode falhar em outros',
          'Ignorar os limites de contexto — prompts muito longos degradam a qualidade das respostas',
          'Esperar que o modelo "entenda" o que você quer sem instrução explícita',
        ],
        readingTimeMinutes: 35,
      },
      {
        id: 'phase-1-concept-2',
        title: 'Sistemas de Memória para Agentes de IA',
        whyItMatters: 'LLMs são stateless por natureza — cada chamada começa do zero. Sistemas de memória resolvem isso, permitindo que agentes mantenham contexto, aprendam com interações e personalizem respostas.',
        whatToLearn: 'Tipos de memória (in-context, external, episódica, semântica), estratégias de gestão de contexto, quando usar cada tipo, trade-offs de custo vs. capacidade.',
        howToLearn: 'Implemente um chatbot simples com memória de conversação usando uma lista deslizante de mensagens. Depois experimente armazenar resumos em vez de histórico completo.',
        resources: [
          'Blog: "Memory in AI Agents" (Lilian Weng, lilianweng.github.io)',
          'Documentação: Anthropic Messages API — Message History',
          'Paper: "MemGPT: Towards LLMs as Operating Systems" (Packer et al., 2023)',
        ],
        pitfalls: [
          'Guardar tudo no contexto — cresce exponencialmente e degrada performance',
          'Não sumarizar memórias antigas — informações obsoletas podem confundir o modelo',
          'Esquecer que memória externa adiciona latência — equilibre recuperação com velocidade',
        ],
        readingTimeMinutes: 30,
      },
      {
        id: 'phase-1-concept-3',
        title: 'Integração com APIs de IA e Gestão de Custos',
        whyItMatters: 'Construir aplicações de IA sustentáveis requer entender pricing, rate limits e estratégias de otimização. Aplicações mal projetadas podem gerar custos imprevisíveis.',
        whatToLearn: 'Estrutura de preços por token, caching de prompts, batching de requisições, rate limits e backoff exponencial, monitoramento de uso.',
        howToLearn: 'Crie um script que rastreia tokens usados por request. Experimente prompt caching do Claude para prompts de sistema repetitivos. Calcule o custo de diferentes estratégias.',
        resources: [
          'Anthropic Pricing Page (anthropic.com/pricing)',
          'Documentação: Prompt Caching (docs.anthropic.com)',
          'Guia: "How to Estimate LLM API Costs" (Simon Willison)',
        ],
        pitfalls: [
          'Não monitorar uso até receber a fatura — configure alertas de custo desde o início',
          'Ignorar prompt caching para prompts de sistema fixos — redução de custo significativa',
          'Não implementar retry logic com backoff — requisições falham e precisam de recuperação',
        ],
        readingTimeMinutes: 25,
      },
    ],
    projects: [
      {
        id: 'phase-1-project-1',
        title: 'Assistente CLI com Memória de Sessão',
        description: 'Construa um assistente de linha de comando que mantém contexto dentro de uma sessão usando a API do Claude, com histórico deslizante de 20 mensagens e sumarização automática.',
        steps: [
          {
            title: 'Configurar projeto Node.js com TypeScript e SDK Anthropic',
            description: 'Inicialize um projeto com `npm init`, instale @anthropic-ai/sdk, configure tsconfig.json com strict mode e crie a estrutura básica do CLI.',
          },
          {
            title: 'Implementar loop de conversação básico',
            description: 'Crie uma função que lê input do usuário via readline, envia para a API com histórico de mensagens e exibe a resposta em streaming.',
          },
          {
            title: 'Adicionar gestão de contexto com janela deslizante',
            description: 'Implemente truncamento automático: quando o histórico exceder 20 mensagens, remova as mais antigas preservando a primeira mensagem do sistema.',
          },
          {
            title: 'Implementar sumarização automática de contexto',
            description: 'Quando o histórico atingir 15 mensagens, gere um resumo das primeiras 10 e substitua-as pelo resumo, mantendo continuidade da conversa.',
          },
          {
            title: 'Adicionar comandos especiais e tratamento de erros',
            description: 'Implemente /clear para limpar histórico, /cost para mostrar tokens usados, e tratamento de erros para rate limits e falhas de rede com retry exponential backoff.',
          },
        ],
        readinessCriteria: [
          'O assistente mantém contexto correto entre mensagens dentro de uma sessão',
          'O histórico nunca excede 20 mensagens (truncamento funciona)',
          'Erros de API são tratados graciosamente com mensagem ao usuário',
          'O comando /cost mostra estimativa de tokens usados na sessão',
        ],
      },
      {
        id: 'phase-1-project-2',
        title: 'Sistema de Prompts Reutilizáveis com Caching',
        description: 'Crie uma biblioteca de prompts de sistema especializados (tutor, revisor de código, analista de dados) com prompt caching do Claude para reduzir custos em 80%+ em uso repetido.',
        steps: [
          {
            title: 'Projetar biblioteca de prompts especializados',
            description: 'Defina 3 personas: Tutor de IA (explica conceitos), Revisor de Código (revisa TypeScript), Analista de Dados (interpreta resultados). Cada um com prompt de sistema > 1024 tokens para ativar caching.',
          },
          {
            title: 'Implementar prompt caching com anthropic-beta',
            description: 'Use o header `anthropic-beta: prompt-caching-2024-07-31` e adicione `cache_control: {type: "ephemeral"}` nos blocos de system prompt para ativar caching automático.',
          },
          {
            title: 'Criar interface de seleção de persona',
            description: 'Implemente um menu interativo que permite ao usuário escolher a persona antes de iniciar a conversa, carregando o prompt de sistema correspondente.',
          },
          {
            title: 'Instrumentar métricas de caching',
            description: 'Exiba ao final de cada request: tokens de input, tokens em cache (cache_read_input_tokens), cache creation tokens, e estimativa de economia em USD.',
          },
        ],
        readinessCriteria: [
          'Cada persona tem comportamento visivelmente diferente nas respostas',
          'Requests subsequentes com a mesma persona mostram cache_read_input_tokens > 0',
          'A economia de custo é visível nas métricas após o primeiro request',
          'A troca de persona limpa corretamente o contexto anterior',
        ],
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'RAG e Retrieval',
    objective: 'Construir sistemas de Retrieval Augmented Generation para conectar LLMs a bases de conhecimento externas',
    weekRange: [3, 4],
    color: '#7c3aed',
    concepts: [
      {
        id: 'phase-2-concept-1',
        title: 'Embeddings e Similaridade Semântica',
        whyItMatters: 'Embeddings são a ponte entre linguagem natural e busca matemática. Sem entendê-los, você não consegue construir sistemas de busca semântica ou RAG eficazes.',
        whatToLearn: 'O que são vetores de embedding, modelos de embedding (text-embedding-3-small, etc.), métricas de similaridade (cosine, dot product, euclidean), normalização de vetores.',
        howToLearn: 'Gere embeddings para 20 frases e visualize clusters com t-SNE. Compare a similaridade entre pares e observe como frases semanticamente similares ficam próximas no espaço vetorial.',
        resources: [
          'Blog: "The Illustrated Word2Vec" (Jay Alammar)',
          'OpenAI Embeddings Guide (platform.openai.com/docs/guides/embeddings)',
          'Paper: "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks"',
        ],
        pitfalls: [
          'Usar embeddings sem normalização — similaridade cosine requer vetores normalizados',
          'Comparar embeddings de modelos diferentes — cada modelo tem seu próprio espaço vetorial',
          'Ignorar truncamento de texto — textos longos perdem qualidade nos embeddings',
        ],
        readingTimeMinutes: 30,
      },
      {
        id: 'phase-2-concept-2',
        title: 'Vector Stores e Indexação',
        whyItMatters: 'Buscar entre milhões de embeddings em milliseconds requer estruturas de dados especializadas. Vector stores são o coração de qualquer sistema RAG em produção.',
        whatToLearn: 'HNSW e IVF como algoritmos de busca aproximada, trade-offs entre precisão e velocidade, opções de vector stores (Chroma, Pinecone, pgvector, Weaviate), chunking strategies.',
        howToLearn: 'Indexe 100 documentos no Chroma (local). Teste busca por similaridade e compare com busca exata. Meça tempo de resposta e precisão com diferentes configurações de chunking.',
        resources: [
          'Documentação: ChromaDB Getting Started (docs.trychroma.com)',
          'Blog: "Vector databases are the wrong abstraction" (Transposit)',
          'Paper: "FAISS: A Library for Efficient Similarity Search"',
        ],
        pitfalls: [
          'Chunks muito grandes — perdem especificidade; muito pequenos — perdem contexto',
          'Não testar recall — um vector store pode parecer funcionar mas perder documentos relevantes',
          'Ignorar metadados — filtros por metadado aceleram busca e melhoram precisão',
        ],
        readingTimeMinutes: 35,
      },
      {
        id: 'phase-2-concept-3',
        title: 'Padrões de RAG: Naive, Advanced e Modular',
        whyItMatters: 'RAG básico funciona para demos mas falha em produção. Entender padrões avançados como HyDE, re-ranking e RAG modular é o que separa protótipos de sistemas confiáveis.',
        whatToLearn: 'RAG ingênuo vs. RAG avançado, HyDE (Hypothetical Document Embeddings), re-ranking com cross-encoders, RAG modular, avaliação de RAG com métricas como RAGAS.',
        howToLearn: 'Implemente RAG básico primeiro. Depois adicione HyDE e compare a qualidade das respostas. Meça com RAGAS: faithfulness, answer relevancy, context recall.',
        resources: [
          'Paper: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" (Lewis et al., 2020)',
          'Blog: "Advanced RAG Techniques" (LlamaIndex docs)',
          'Framework: RAGAS — RAG Assessment (github.com/explodinggradients/ragas)',
        ],
        pitfalls: [
          'Não avaliar RAG quantitativamente — "parece bom" não é suficiente para produção',
          'Usar apenas busca semântica — busca híbrida (semântica + BM25) é geralmente superior',
          'Ignorar o problema de lost-in-the-middle — LLMs tendem a ignorar contexto no meio',
        ],
        readingTimeMinutes: 40,
      },
    ],
    projects: [
      {
        id: 'phase-2-project-1',
        title: 'Q&A sobre Documentação com RAG',
        description: 'Construa um sistema de perguntas e respostas sobre a documentação do Claude (ou qualquer documentação técnica) usando ChromaDB local e embeddings, com avaliação de qualidade.',
        steps: [
          {
            title: 'Pipeline de ingestão de documentos',
            description: 'Baixe e processe a documentação escolhida. Implemente chunking semântico com sobreposição de 20%, gere embeddings com um modelo de embedding e indexe no ChromaDB.',
          },
          {
            title: 'Pipeline de retrieval e resposta',
            description: 'Dado uma pergunta, gere embedding, busque os top-5 chunks mais similares, construa prompt com contexto recuperado e gere resposta com Claude.',
          },
          {
            title: 'Implementar re-ranking dos resultados',
            description: 'Após recuperar os top-10 chunks, use um cross-encoder para re-rankear e selecionar os top-3 mais relevantes antes de enviar ao LLM.',
          },
          {
            title: 'Avaliação com métricas RAGAS',
            description: 'Crie um conjunto de 20 perguntas com respostas esperadas. Avalie faithfulness (a resposta está fundamentada no contexto?) e answer_relevancy (a resposta é relevante?).',
          },
        ],
        readinessCriteria: [
          'Sistema responde perguntas sobre a documentação com citação das fontes',
          'Re-ranking melhora a qualidade das respostas medível em ≥1 métrica RAGAS',
          'Faithfulness score ≥ 0.7 no conjunto de avaliação',
          'Latência de resposta ≤ 5s para perguntas típicas',
        ],
      },
    ],
  },
  {
    id: 'phase-3',
    name: 'Agentes e Automação',
    objective: 'Projetar e construir agentes de IA autônomos com uso de ferramentas e pipelines de automação',
    weekRange: [5, 6],
    color: '#ea580c',
    concepts: [
      {
        id: 'phase-3-concept-1',
        title: 'Arquitetura de Agentes e o Loop ReAct',
        whyItMatters: 'O paradigma ReAct (Reasoning + Acting) é a base de quase todo agente moderno. Entendê-lo é essencial para projetar agentes que raciocinam antes de agir e aprendem com feedback.',
        whatToLearn: 'Loop Observe-Think-Act, tool use / function calling, padrões de agentes (ReAct, Plan-and-Execute, Reflexion), quando parar um loop de agente, supervisão humana.',
        howToLearn: 'Construa um agente simples com 3 ferramentas (calculator, web_search stub, file_reader). Trace cada passo do loop e observe como o modelo decide quando usar cada ferramenta.',
        resources: [
          'Paper: "ReAct: Synergizing Reasoning and Acting in Language Models" (Yao et al., 2022)',
          'Documentação: Anthropic Tool Use (docs.anthropic.com/tool-use)',
          'Blog: "The Anatomy of Autonomy" (Swyx)',
        ],
        pitfalls: [
          'Loops infinitos — sempre defina um número máximo de iterações',
          'Ferramentas com nomes ambíguos — o modelo não saberá qual usar',
          'Não validar input das ferramentas — agentes podem passar parâmetros inválidos',
        ],
        readingTimeMinutes: 35,
      },
      {
        id: 'phase-3-concept-2',
        title: 'Design de Ferramentas para Agentes',
        whyItMatters: 'A qualidade das ferramentas determina a qualidade do agente. Ferramentas mal projetadas levam a comportamentos imprevisíveis, erros frequentes e custos desnecessários.',
        whatToLearn: 'Princípios de design de ferramentas, schemas JSON bem definidos, tratamento de erros em ferramentas, ferramentas compostas vs. atômicas, segurança e sandboxing.',
        howToLearn: 'Refatore ferramentas existentes seguindo princípios de design. Compare o comportamento do agente com ferramentas bem e mal documentadas. Implemente tratamento de erros robusto.',
        resources: [
          'Documentação: Tool Use Best Practices (Anthropic)',
          'Blog: "How to Design Great Tools for LLM Agents" (Eugene Yan)',
          'Paper: "ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs"',
        ],
        pitfalls: [
          'Ferramentas que fazem muitas coisas — mantenha cada ferramenta com uma única responsabilidade',
          'Descrições vagas nas ferramentas — o modelo usa a descrição para decidir quando usar',
          'Não retornar erros úteis — o agente precisa saber o que deu errado para corrigir',
        ],
        readingTimeMinutes: 25,
      },
    ],
    projects: [
      {
        id: 'phase-3-project-1',
        title: 'Agente de Pesquisa com Ferramentas',
        description: 'Construa um agente de pesquisa que usa ferramentas para buscar informações, processar texto e gerar relatórios estruturados de forma autônoma.',
        steps: [
          {
            title: 'Implementar conjunto de ferramentas de pesquisa',
            description: 'Crie ferramentas: search_web (stub com dados mock), read_file, write_file, summarize_text. Cada ferramenta com schema JSON bem definido e tratamento de erros.',
          },
          {
            title: 'Implementar loop de agente com limite de iterações',
            description: 'Construa o loop ReAct: enviar mensagem com ferramentas disponíveis, processar tool_use blocks, executar ferramentas, retornar tool_result, repetir. Limite de 10 iterações.',
          },
          {
            title: 'Adicionar planejamento explícito antes da execução',
            description: 'Implemente um passo de planejamento onde o agente primeiro cria um plano em texto antes de executar ferramentas, e revisa o plano após cada etapa.',
          },
          {
            title: 'Gerar relatório estruturado ao final',
            description: 'Ao completar a pesquisa, o agente gera um relatório estruturado em Markdown com: sumário executivo, fontes consultadas, conclusões e próximos passos sugeridos.',
          },
        ],
        readinessCriteria: [
          'Agente completa uma tarefa de pesquisa de 3+ passos sem intervenção humana',
          'Loop nunca excede o limite de 10 iterações',
          'Erros em ferramentas são recuperados graciosamente sem travar o agente',
          'Relatório final segue estrutura definida e cita fontes usadas',
        ],
      },
      {
        id: 'phase-3-project-2',
        title: 'Pipeline de Automação com Agente Multi-Etapas',
        description: 'Construa um pipeline de automação que usa um agente para processar dados, tomar decisões condicionais e executar ações em sequência, com rollback em caso de falha.',
        steps: [
          {
            title: 'Definir o pipeline e suas etapas',
            description: 'Documente o pipeline completo: entrada, cada etapa de processamento, decisões condicionais, saída esperada e pontos de falha possíveis. Use diagrama de fluxo.',
          },
          {
            title: 'Implementar ferramentas do pipeline',
            description: 'Crie ferramentas específicas para o pipeline: validar_entrada, processar_dados, tomar_decisao, executar_acao, registrar_resultado. Cada uma com schema e tratamento de erro.',
          },
          {
            title: 'Implementar lógica de rollback',
            description: 'Para cada etapa que modifica estado, implemente ação de rollback. Se qualquer etapa falhar, o agente deve desfazer as mudanças anteriores na ordem inversa.',
          },
          {
            title: 'Testar com cenários de falha',
            description: 'Crie 5 cenários de falha (falha em etapa 1, 2, 3, falha total, falha intermitente). Verifique que rollback funciona corretamente em cada cenário e estado final é consistente.',
          },
        ],
        readinessCriteria: [
          'Pipeline completa com sucesso os 5 casos de uso normais definidos',
          'Rollback funciona corretamente em todos os 5 cenários de falha',
          'Estado do sistema é sempre consistente após sucesso ou falha',
          'Log completo de cada etapa permite auditoria do que aconteceu',
        ],
      },
    ],
  },
  {
    id: 'phase-4',
    name: 'Fine-tuning e Adaptação',
    objective: 'Adaptar modelos de IA a domínios específicos através de fine-tuning, few-shot learning e técnicas de especialização',
    weekRange: [7, 8],
    color: '#16a34a',
    concepts: [
      {
        id: 'phase-4-concept-1',
        title: 'Quando Fine-tunar vs. Prompting',
        whyItMatters: 'Fine-tuning tem custo alto e complexidade maior. Saber quando é realmente necessário — versus prompting avançado — é crítico para não desperdiçar recursos.',
        whatToLearn: 'Trade-offs fine-tuning vs. prompting, casos de uso reais para fine-tuning (formato específico, domínio muito especializado, latência crítica), LoRA e PEFT, custos e infraestrutura.',
        howToLearn: 'Para um problema específico de formatação, compare: (1) prompt de sistema detalhado, (2) few-shot exemplos, (3) fine-tuning com 50 exemplos. Meça consistência e custo.',
        resources: [
          'Blog: "Fine-tuning vs. Prompting: When to Use Each" (Hamel Husain)',
          'Documentação: OpenAI Fine-tuning Guide',
          'Paper: "LoRA: Low-Rank Adaptation of Large Language Models" (Hu et al., 2021)',
        ],
        pitfalls: [
          'Fine-tunar quando prompting resolve — gasta recursos desnecessariamente',
          'Dataset de fine-tuning pequeno demais — mínimo recomendado é 50-100 exemplos de qualidade',
          'Overfitting em exemplos de treinamento — o modelo memoriza em vez de generalizar',
        ],
        readingTimeMinutes: 30,
      },
      {
        id: 'phase-4-concept-2',
        title: 'Construção e Curadoria de Datasets',
        whyItMatters: 'A qualidade do dataset determina a qualidade do modelo fine-tunado. Dados ruins produzem modelos ruins, independente de quanto você gastar em computação.',
        whatToLearn: 'Formatos de dataset (JSONL, Alpaca, ShareGPT), técnicas de coleta de dados, data augmentation, validação de qualidade, contaminação de dados e vieses.',
        howToLearn: 'Construa um dataset de 100 exemplos para um task específico. Aplique técnicas de augmentation para chegar a 500. Divida em train/val/test e avalie consistência.',
        resources: [
          'Blog: "Data-centric AI: The Future of Machine Learning" (Andrew Ng)',
          'Ferramenta: LabelStudio para anotação de dados',
          'Paper: "Self-Instruct: Aligning Language Models with Self-Generated Instructions"',
        ],
        pitfalls: [
          'Não separar train/val/test antes de qualquer análise — data leakage contamina avaliação',
          'Exemplos inconsistentes no dataset — o modelo aprende o ruído em vez do padrão',
          'Ignorar diversidade — dataset homogêneo leva a modelo frágil',
        ],
        readingTimeMinutes: 35,
      },
    ],
    projects: [
      {
        id: 'phase-4-project-1',
        title: 'Especialista em Domínio via Few-Shot e Avaliação',
        description: 'Crie um sistema que demonstra como few-shot learning e prompts especializados podem substituir fine-tuning para um domínio específico, com avaliação rigorosa da qualidade.',
        steps: [
          {
            title: 'Escolher domínio e definir task',
            description: 'Escolha um domínio específico (ex: análise de código Python, revisão de contratos, diagnóstico de erros de SQL). Defina 3-5 tipos de task que o sistema deve executar bem.',
          },
          {
            title: 'Construir dataset de avaliação',
            description: 'Crie 30 exemplos de entrada com saída esperada. Divida em: 10 para few-shot exemplos no prompt, 20 para avaliação. Documente critérios de qualidade.',
          },
          {
            title: 'Iterar sobre o prompt até atingir qualidade alvo',
            description: 'Comece com zero-shot. Adicione few-shot progressivamente (2, 4, 6, 8 exemplos). Meça acurácia em cada configuração. Documente a curva de aprendizado.',
          },
          {
            title: 'Comparar com baseline e documentar trade-offs',
            description: 'Compare o sistema com uma chamada genérica ao modelo. Documente: diferença de qualidade, custo adicional por tokens, latência e quando vale a pena o investimento.',
          },
        ],
        readinessCriteria: [
          'Sistema alcança ≥ 80% de qualidade no conjunto de avaliação',
          'Documentação clara de como os few-shot exemplos foram selecionados',
          'Comparação quantitativa com baseline zero-shot',
          'Análise de custo-benefício em relação ao fine-tuning documentada',
        ],
      },
    ],
  },
  {
    id: 'phase-5',
    name: 'Segurança e Ética em IA',
    objective: 'Aplicar princípios de IA responsável, detectar e mitigar riscos de segurança e construir sistemas alinhados com valores humanos',
    weekRange: [9, 10],
    color: '#ca8a04',
    concepts: [
      {
        id: 'phase-5-concept-1',
        title: 'Prompt Injection e Jailbreaks',
        whyItMatters: 'Aplicações de IA em produção são alvo constante de ataques. Entender vetores de ataque é prerequisito para construir sistemas seguros e robustos.',
        whatToLearn: 'Tipos de prompt injection (direto, indireto), jailbreaks comuns, RLHF e suas limitações de segurança, detecção e mitigação de ataques, input sanitization.',
        howToLearn: 'Estude os 10 ataques mais comuns documentados. Teste cada um em ambiente controlado. Para cada ataque, implemente uma mitigação e teste sua eficácia.',
        resources: [
          'OWASP LLM Top 10 (owasp.org/www-project-top-10-for-large-language-model-applications)',
          'Blog: "Prompt Injection Attacks Against GPT-3" (Simon Willison)',
          'Paper: "Universal and Transferable Adversarial Attacks on Aligned Language Models"',
        ],
        pitfalls: [
          'Confiar cegamente em output de LLMs sem validação — sempre valide antes de executar código',
          'Usar o LLM para moderar seu próprio output — conflito de interesses fundamental',
          'Pensar que o modelo é imune a ataques porque é "novo" — vulnerabilidades aparecem constantemente',
        ],
        readingTimeMinutes: 35,
      },
      {
        id: 'phase-5-concept-2',
        title: 'Viés, Equidade e IA Responsável',
        whyItMatters: 'Sistemas de IA reproduzem e amplificam vieses dos dados de treinamento. Em aplicações que afetam pessoas reais, isso tem consequências éticas e legais graves.',
        whatToLearn: 'Tipos de viés em ML (representação, medição, aggregation), fairness metrics (equalização de oportunidades, paridade demográfica), técnicas de debiasing, regulações (GDPR, AI Act).',
        howToLearn: 'Teste um LLM com prompts demograficamente variados para a mesma task. Documente diferenças de qualidade ou tom. Proponha mitigações para os vieses encontrados.',
        resources: [
          'Paper: "A Survey on Bias and Fairness in Machine Learning" (Mehrabi et al., 2021)',
          'Ferramenta: IBM AI Fairness 360 (aif360.mybluemix.net)',
          'Guia: EU AI Act Overview (artificialintelligenceact.eu)',
        ],
        pitfalls: [
          'Tratar fairness como uma única métrica — diferentes métricas de fairness são incompatíveis',
          'Ignorar viés de representação nos dados de avaliação',
          'Escalar para produção sem auditoria de equidade',
        ],
        readingTimeMinutes: 30,
      },
    ],
    projects: [
      {
        id: 'phase-5-project-1',
        title: 'Guardrails para Aplicação de IA',
        description: 'Implemente um sistema de guardrails (verificações de entrada e saída) para uma aplicação de IA, detectando e bloqueando prompt injection, conteúdo prejudicial e outputs problemáticos.',
        steps: [
          {
            title: 'Catalogar vetores de ataque relevantes',
            description: 'Para a aplicação escolhida, identifique os 5 principais vetores de ataque. Documente exemplos reais de cada ataque e o dano potencial se não mitigado.',
          },
          {
            title: 'Implementar guardrails de entrada',
            description: 'Crie um pipeline de verificação de input: sanitização de texto, detecção de prompt injection via classificador simples, rate limiting por usuário.',
          },
          {
            title: 'Implementar guardrails de saída',
            description: 'Adicione verificações no output: detecção de PII (informações pessoais), validação de formato esperado, verificação de que o output não contradiz o sistema de valores definido.',
          },
          {
            title: 'Criar suite de testes de segurança',
            description: 'Desenvolva 20 testes adversariais que tentam burlar cada guardrail. Documente taxa de detecção, falsos positivos e falsos negativos. Itere até atingir 90%+ de detecção.',
          },
        ],
        readinessCriteria: [
          'Guardrails bloqueiam 90%+ dos ataques catalogados na suite de testes',
          'Taxa de falsos positivos ≤ 5% em inputs legítimos',
          'Cada guardrail tem logging adequado para auditoria',
          'Documentação clara do modelo de ameaças (threat model) da aplicação',
        ],
      },
    ],
  },
  {
    id: 'phase-6',
    name: 'Produção e Escalabilidade',
    objective: 'Implantar sistemas de IA em produção com monitoramento, observabilidade e práticas de MLOps',
    weekRange: [11, 12],
    color: '#dc2626',
    concepts: [
      {
        id: 'phase-6-concept-1',
        title: 'Observabilidade em Sistemas de IA',
        whyItMatters: 'Sistemas de IA em produção falham de formas inesperadas. Sem observabilidade, você descobre os problemas quando os usuários reclamam — não quando acontecem.',
        whatToLearn: 'LLM tracing (LangSmith, Phoenix), métricas de latência e custo por request, drift de qualidade ao longo do tempo, alertas automáticos, logging de inputs/outputs.',
        howToLearn: 'Adicione tracing a um sistema existente. Defina métricas chave (latência p95, custo médio, taxa de erro). Crie um dashboard simples e configure alertas para anomalias.',
        resources: [
          'Ferramenta: LangSmith (smith.langchain.com)',
          'Blog: "LLM Observability: What to Monitor and Why" (Arize AI)',
          'Documentação: OpenTelemetry for LLMs',
        ],
        pitfalls: [
          'Logar apenas erros — inputs/outputs são críticos para debugging',
          'Não monitorar drift — a qualidade do modelo pode degradar sutilmente',
          'Armazenar dados de usuário em logs sem anonimização — risco legal e de privacidade',
        ],
        readingTimeMinutes: 30,
      },
      {
        id: 'phase-6-concept-2',
        title: 'Avaliação Contínua e LLM-as-Judge',
        whyItMatters: 'Avaliação manual não escala. LLM-as-judge permite avaliar automaticamente a qualidade de respostas a custo viável, mantendo padrões de qualidade em produção.',
        whatToLearn: 'Padrões de LLM-as-judge, design de rubricas de avaliação, agreement rate com avaliadores humanos, evitando position bias e verbosity bias, datasets de avaliação.',
        howToLearn: 'Implemente um avaliador automático para um sistema existente. Compare com avaliação humana em 50 exemplos. Calcule correlação e identifique onde o juiz automático falha.',
        resources: [
          'Paper: "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (Zheng et al., 2023)',
          'Framework: RAGAS (github.com/explodinggradients/ragas)',
          'Blog: "Your AI Product Needs Evals" (Hamel Husain)',
        ],
        pitfalls: [
          'Usar o mesmo modelo como juiz e como sistema avaliado — viés de auto-favorecimento',
          'Rubricas vagas — o juiz precisa de critérios específicos e mensuráveis',
          'Não calibrar o juiz com avaliadores humanos — alta correlação não é garantida',
        ],
        readingTimeMinutes: 35,
      },
    ],
    projects: [
      {
        id: 'phase-6-project-1',
        title: 'Pipeline de Avaliação Automática',
        description: 'Construa um pipeline completo de avaliação automática para um sistema de IA existente, usando LLM-as-judge com múltiplas métricas e comparação com baseline humano.',
        steps: [
          {
            title: 'Definir rubricas de avaliação',
            description: 'Para o sistema escolhido, defina 4-5 dimensões de qualidade com rubricas detalhadas (1-5 escala) e exemplos concretos de cada nível. Revise com exemplos reais.',
          },
          {
            title: 'Implementar avaliador LLM-as-judge',
            description: 'Crie um avaliador que recebe (input, output, rubrica) e retorna score + justificativa por dimensão. Use Claude com thinking para maior consistência.',
          },
          {
            title: 'Construir dataset de validação do avaliador',
            description: 'Avalie manualmente 50 exemplos. Compare com scores do avaliador automático. Calcule correlação de Spearman e identifique dimensões com baixa concordância.',
          },
          {
            title: 'Automatizar pipeline com relatório periódico',
            description: 'Configure avaliação automática de 10% das respostas em produção. Gere relatório semanal com tendências de qualidade, alertas de degradação e exemplos problemáticos.',
          },
        ],
        readinessCriteria: [
          'Correlação de Spearman ≥ 0.7 com avaliadores humanos',
          'Pipeline processa 100 exemplos em ≤ 5 minutos',
          'Relatório automático identifica corretamente ao menos um problema real de qualidade',
          'Custo de avaliação automática ≤ 10% do custo de produção',
        ],
      },
    ],
  },
  {
    id: 'phase-7',
    name: 'Projeto Final Integrado',
    objective: 'Integrar todas as competências do programa em um projeto de IA aplicada completo e pronto para produção',
    weekRange: [13, 14],
    color: '#b45309',
    concepts: [
      {
        id: 'phase-7-concept-1',
        title: 'Arquitetura de Sistemas de IA End-to-End',
        whyItMatters: 'Componentes individuais funcionam em isolamento mas falham ao ser integrados. Entender como projetar o sistema como um todo — com suas interdependências — é o que define um engenheiro de IA sênior.',
        whatToLearn: 'Padrões de arquitetura de sistemas de IA (pipeline, orquestrador, mesh de agentes), trade-offs de consistência vs. disponibilidade, design para resiliência e fallback.',
        howToLearn: 'Desenhe a arquitetura do seu projeto final antes de implementar. Identifique pontos únicos de falha. Para cada componente, defina o comportamento de fallback.',
        resources: [
          'Blog: "Patterns for Building LLM-based Systems & Products" (Eugene Yan)',
          'Livro: "Designing Machine Learning Systems" (Chip Huyen)',
          'Blog: "Building LLM Applications for Production" (Hainan Xu)',
        ],
        pitfalls: [
          'Começar a implementar sem diagrama de arquitetura — acúmulo de dívida técnica',
          'Não definir SLOs antes de construir — sem métrica, não sabe quando o sistema é "bom o suficiente"',
          'Dependências circulares entre componentes — cria problemas de ordem de inicialização',
        ],
        readingTimeMinutes: 40,
      },
    ],
    projects: [
      {
        id: 'phase-7-project-1',
        title: 'Projeto Capstone: Sistema de IA Aplicada',
        description: 'Integre as técnicas das 6 fases anteriores em um sistema completo que resolve um problema real. O projeto deve incluir: RAG, agentes com ferramentas, guardrails de segurança e observabilidade.',
        steps: [
          {
            title: 'Definir problema e arquitetura',
            description: 'Escolha um problema real que se beneficia de IA. Documente: proposta de valor, usuários-alvo, métricas de sucesso, arquitetura de componentes e plano de implementação de 2 semanas.',
          },
          {
            title: 'Implementar core do sistema com RAG e agentes',
            description: 'Construa o núcleo: pipeline de ingestão de dados, sistema RAG para contexto, agente com ferramentas para ação. Conecte os componentes com interfaces bem definidas.',
          },
          {
            title: 'Adicionar segurança e guardrails',
            description: 'Implemente guardrails de entrada e saída baseados na fase 5. Adicione rate limiting, logging de segurança e tratamento de casos extremos identificados no threat model.',
          },
          {
            title: 'Instrumentar e avaliar',
            description: 'Adicione observabilidade completa (tracing, métricas, logs). Configure avaliação automática com LLM-as-judge. Documente performance baseline e identifique 3 áreas de melhoria.',
          },
          {
            title: 'Demo e documentação final',
            description: 'Prepare demo de 5 minutos mostrando o sistema em ação. Escreva README com: motivação, arquitetura, instruções de setup, métricas alcançadas e lições aprendidas.',
          },
        ],
        readinessCriteria: [
          'Sistema integra RAG, agentes e ao menos 2 guardrails de segurança',
          'Observabilidade implementada: logs estruturados, métricas de latência e custo',
          'Taxa de sucesso ≥ 80% nas tarefas definidas no plano',
          'Demo ao vivo funciona sem erros em pelo menos 3 cenários de uso',
          'Documentação completa no README com arquitetura e decisões de design',
        ],
      },
    ],
  },
];
