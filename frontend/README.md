# Jeopardy Club

Frontend React + TypeScript para criar salas, selecionar temas e exibir o tabuleiro em duas fases.

## Executar

Na raiz do monorepo, rode `npm run dev`. O Vite encaminha `/questions` para `http://localhost:3000`; o Socket.IO conecta ao mesmo endereço.

Para apontar o frontend para outro ambiente, configure:

- `VITE_API_URL`: origem da API de perguntas (sem `/questions` no final).
- `VITE_SOCKET_URL`: origem do servidor Socket.IO.

## Telas

- `/`: criar uma sala ou entrar com código e nome.
- `/questions`: criar, editar, excluir e filtrar perguntas por tema.
- `/host/setup`: selecionar 10 temas com pelo menos cinco questões cada.
- `/game/:roomId`: tabuleiro com cinco temas e cinco valores por fase; a segunda fase dobra os valores.

## Contrato atual do backend

O frontend usa `GET /questions`, `GET /questions/themes` e os endpoints POST, PUT e DELETE de `/questions` para gerenciar questões. Socket.IO cria/entra em salas, compartilha o tabuleiro, recupera o nome do organizador, seleciona questões pelo índice global, mostra respostas, sincroniza pontuação e fase, usa o buzzer e encerra a participação. O organizador escolhe questões clicando nos cards; os jogadores veem a questão sincronizada e podem usar o buzzer.

O fluxo de avaliação da resposta ainda depende de um evento do backend que permita ao organizador indicar qual jogador respondeu corretamente ou incorretamente e atualizar os pontos. Também é necessário tratar desconexões inesperadas para remover jogadores que não acionaram a opção “Sair”.
