# Jeopardy Club

Frontend React + TypeScript para criar salas, selecionar temas e exibir o tabuleiro em duas fases.

## Executar

Na raiz do monorepo, rode `npm run dev`. O Vite encaminha `/questions` para `http://localhost:3000`; o Socket.IO conecta ao mesmo endereço.

Para apontar o frontend para outro ambiente, configure:

- `VITE_API_URL`: origem da API de perguntas (sem `/questions` no final).
- `VITE_SOCKET_URL`: origem do servidor Socket.IO.

## Telas

- `/`: criar uma sala ou entrar com código e nome.
- `/host/setup`: selecionar 12 temas com pelo menos cinco questões cada.
- `/game/:roomId`: tabuleiro com seis temas e cinco valores por fase; a segunda fase dobra os valores.

## Contrato atual do backend

O frontend consulta `GET /questions` e usa `create-room`, `join-room`, `room-id`, `show-question` e `update-scores`. A escolha de temas e o tabuleiro são mantidos no estado local do organizador até o backend oferecer eventos para compartilhar a configuração.

Para uma partida multiplayer completa, o backend também precisa registrar o organizador na sala, transmitir a lista inicial/atualizada de jogadores e a configuração do tabuleiro, confirmar falhas ao entrar e expor eventos de início de fase, buzzer e validação de resposta. O evento `show-question` deve identificar também a fase para evitar ambiguidades entre os dois tabuleiros.
