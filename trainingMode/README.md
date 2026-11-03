# Training Mode - Interactive Interview Preparation

**Training Mode** é uma plataforma interativa gamificada desenvolvida para preparar estudantes e profissionais para processos seletivos e entrevistas técnicas e comportamentais em inglês.

---

## 🎮 Estrutura do Projeto

O projeto funciona de forma 100% autônoma e independente:

```
trainingMode/
├── index.html                   # Ponto de entrada principal (redireciona para o World Map: pages/trainingMode.html)
├── README.md                    # Documentação do projeto isolado
├── assets/
│   ├── audio/                   # Áudios para exercícios de escuta
│   ├── favicon/                 # Favicons em todos os tamanhos padrão
│   ├── fonts/                   # Fontes pixel e retro (MortalKombat1, PixelOperator)
│   └── images/                  # Imagens de fundo, botões, ícones e avatares
├── db/                          # Banco de dados estático em JSON
├── pages/                       # Telas e módulos do jogo
│   ├── trainingMode.html        # World Map interativo com todas as fases e progresso
│   ├── lesson.html              # Módulo de lições teóricas e práticas
│   ├── quiz.html                # Quiz de múltipla escolha com explicações
│   ├── audio_quiz.html          # Quiz com áudio para treino de escuta e pronúncia
│   ├── fill_in_blanks.html      # Exercícios de preenchimento de lacunas
│   ├── common_questions.html    # Treinamento com perguntas comuns de entrevista
│   ├── vocabulary_frenzy.html   # Modo rápido de vocabulário e termos técnicos
│   ├── war_room.html            # Simulação de crise e reuniões em tempo real
│   ├── interview_boss.html      # Confronto final contra os chefes de entrevista
│   └── [demais páginas de dicas]
├── scripts/                     # Toda a lógica em Vanilla JavaScript
│   ├── minimap.js               # Renderização do World Map e conexões SVG
│   ├── resume.js                # Sistema de construção de currículo interativo
│   └── [demais scripts de módulos]
├── styles/                      # Folhas de estilo CSS dedicadas
│   ├── global.css               # Reset de CSS
│   ├── fonts.css                # Configuração das fontes personalizadas
│   └── minimap.css              # Estilos do World Map
```

---

## 🚀 Como Executar

Por ser uma aplicação baseada em **HTML5, CSS3 e JavaScript Vanilla**, não é necessário instalar nenhum pacote do Node.js ou gerenciador de dependências.

### Opção 1: Live Server (VS Code)
1. Abra a pasta `trainingMode` no VS Code.
2. Clique com o botão direito no `index.html` (ou `pages/trainingMode.html`) e selecione **Open with Live Server**.

### Opção 2: Servidor HTTP Local (Python / Node / PHP)
No terminal, dentro da pasta `trainingMode`:
- Com Python:
  ```bash
  python -m http.server 8000
  ```
- Com npx:
  ```bash
  npx serve .
  ```
- Acesse `http://localhost:8000` no seu navegador.

### Opção 3: GitHub Pages
Basta apontar a raiz do repositório ou branch para esta pasta. O `index.html` redirecionará automaticamente para o World Map (`pages/trainingMode.html`).

---

## 🛡️ Independência do Módulo
- Sem qualquer dependência externa de pastas do Job Interview Kombat.
- Fontes, favicons, imagens de botões e avatares encapsulados internamente.
- Progresso do usuário preservado via `localStorage`.
