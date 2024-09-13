/* Informação usada para desenhar os navios */
/* Definição de arrays para representar os navios:
   Cada navio é definido por um array que contém as coordenadas dos quadrados ocupados pelo navio
   em dois tipos de orientação (horizontal e vertical). */
   var ship = [[[1, 5], [1, 2, 5], [1, 2, 3, 5], [1, 2, 3, 4, 5]], 
   [[6, 10], [6, 7, 10], [6, 7, 8, 10], [6, 7, 8, 9, 10]]];
   
/* Informação usada para desenhar os navios afundados */
/* Similar à variável 'ship', mas contém as coordenadas para representar o navio afundado. */
var dead = [[[201, 203], [201, 202, 203], [201, 202, 202, 203], [201, 202, 202, 202, 203]], 
   [[204, 206], [204, 205, 206], [204, 205, 205, 206], [204, 205, 205, 205, 206]]];
   
/* Descrição dos navios */
/* Array com a descrição dos tipos de navios:
Cada navio é representado por um array com o nome, comprimento e quantidade disponível. */
var shiptypes = [["Rebocador", 2, 4], ["Contratopedeiro", 3, 4], ["Cruzador", 4, 2], ["Porta-avioes", 5, 1]];

var gridx = 16, gridy = 16;  /* Dimensões da grade do jogo: 16x16 */
var player1 = [], player2 = []; /* Grades para os tabuleiros dos jogadores */
var player1Ships = [], player2Ships = []; /* Informações sobre os navios dos jogadores */
var player1Lives = 0, player2Lives = 0; /* Contadores de vidas restantes dos jogadores */
var currentPlayer = 1; /* Jogador atual (1 ou 2) */
var statusMsg = ""; /* Mensagem de status do jogo */

/* Função para precarregar as imagens */
/* Precarrega as imagens necessárias para o jogo e as armazena no array 'preloaded'. */
var preloaded = [];

function imagePreload() {
   // Define um array com os IDs das imagens que precisam ser carregadas.
   var i, ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 101, 102, 103, 201, 202, 203, 204, 205, 206];

   // Define a mensagem de status na janela para indicar que as imagens estão sendo carregadas.
   window.status = "Precarregando as imagens.";

   // Loop para iterar sobre cada ID na lista de IDs.
   for (i = 0; i < ids.length; ++i) {
       // Cria um novo objeto Image.
       var img = new Image();

       // Constrói o nome do arquivo da imagem com base no ID atual. Exemplo: "navio1.gif", "navio100.gif", etc.
       var name = "navio" + ids[i] + ".gif";

       // Define o atributo src (source) da imagem com o nome do arquivo construído.
       img.src = name;

       // Armazena o objeto Image no array preloaded na posição correspondente ao índice atual.
       preloaded[i] = img;
   }

   // Remove a mensagem de status da janela quando o carregamento das imagens estiver completo.
   window.status = "";
}

/* Função para colocar os navios nos quadrados */
/* Preenche a grade com os navios de forma aleatória, garantindo que não haja sobreposição. */
function setupPlayer(isPlayer1) {
   // Declara variáveis para as coordenadas e a grade de jogo.
   var y, x;
   var grid = [];

   /* Inicializa a grade com valores padrão */
   // Cria uma grade bidimensional com dimensões definidas por gridx (largura) e gridy (altura).
   // Cada célula da grade é inicializada com um array [100, -1, 0]:
   //   - 100 representa uma célula vazia ou água.
   //   - -1 é um marcador de posição para o índice do navio (não atribuído ainda).
   //   - 0 é um marcador de posição para o índice do navio afundado (não atribuído ainda).
   for (y = 0; y < gridx; ++y) {
       grid[y] = []; // Cria uma nova linha na grade.
       for (x = 0; x < gridx; ++x) {
           grid[y][x] = [100, -1, 0]; // Inicializa cada célula com os valores padrão.
       }
   }

   // Variável para manter o número do navio que está sendo colocado.
   var shipNo = 0;
   // Variável para iterar sobre os tipos de navios.
   var s;

   /* Itera sobre os tipos de navios */
   // Começa do último tipo de navio e vai até o primeiro. Isso pode ajudar a garantir que navios maiores sejam colocados primeiro.
   for (s = shiptypes.length - 1; s >= 0; --s) {
       var i;

       /* Coloca os navios na grade */
       // Itera sobre a quantidade de navios do tipo atual.
       for (i = 0; i < shiptypes[s][2]; ++i) {
           // Gera uma direção aleatória para o navio: 0 para horizontal e 1 para vertical.
           var d = Math.floor(Math.random() * 2); 

           // Define o comprimento do navio e ajusta a largura e altura disponíveis dependendo da direção.
           var len = shiptypes[s][1], lx = gridx, ly = gridy, dx = 0, dy = 0;
           if (d == 0) {
               lx = gridx - len; // Ajusta a largura disponível se horizontal.
               dx = 1; // Incrementa x ao longo do comprimento do navio.
           } else {
               ly = gridy - len; // Ajusta a altura disponível se vertical.
               dy = 1; // Incrementa y ao longo do comprimento do navio.
           }

           // Variáveis para coordenadas e validação.
           var x, y, ok;

           /* Encontra uma posição válida para o navio */
           // Tenta encontrar uma posição válida para o navio que não sobreponha outros navios.
           do {
               y = Math.floor(Math.random() * ly); // Escolhe uma coordenada y aleatória.
               x = Math.floor(Math.random() * lx); // Escolhe uma coordenada x aleatória.
               var j, cx = x, cy = y;
               ok = true;

               // Verifica se o navio pode ser colocado na posição escolhida.
               for (j = 0; j < len; ++j) {
                   if (grid[cy][cx][0] < 100) {
                       ok = false; // Se alguma célula já estiver ocupada, a posição não é válida.
                       break;
                   }
                   cx += dx; // Move para a próxima célula na direção x.
                   cy += dy; // Move para a próxima célula na direção y.
               }
           } while (!ok); // Continua tentando até encontrar uma posição válida.

           /* Coloca o navio na grade */
           var j, cx = x, cy = y;
           for (j = 0; j < len; ++j) {
               grid[cy][cx][0] = ship[d][s][j]; // Marca a célula com o ID do navio.
               grid[cy][cx][1] = shipNo; // Define o número do navio na célula.
               grid[cy][cx][2] = dead[d][s][j]; // Define o ID do navio afundado na célula.
               cx += dx; // Move para a próxima célula na direção x.
               cy += dy; // Move para a próxima célula na direção y.
           }

           // Atualiza as informações do jogador com base em qual jogador está configurando.
           if (isPlayer1) {
               player1Ships[shipNo] = [s, shiptypes[s][1]]; // Armazena o tipo e comprimento do navio.
               player1Lives++; // Incrementa o número de vidas (navios) restantes para o jogador 1.
           } else {
               player2Ships[shipNo] = [s, shiptypes[s][1]]; // Armazena o tipo e comprimento do navio.
               player2Lives++; // Incrementa o número de vidas (navios) restantes para o jogador 2.
           }
           shipNo++; // Incrementa o número do navio para o próximo navio a ser colocado.
       }
   }

   // Retorna a grade configurada para o jogador atual.
   return grid;
}

/* Função para mudar as imagens nos quadrados */
/* Atualiza a imagem no tabuleiro de acordo com o estado do quadrado. */
function setImage(y, x, id, isPlayer1) {
   // Verifica se o tabuleiro a ser atualizado é o do jogador 1.
   if (isPlayer1) {
       // Atualiza a grade do jogador 1 com o novo ID.
       // 'id' representa o identificador da imagem que deve ser exibida.
       // player1[y][x][0] armazena o ID da imagem para a célula (y, x).
       player1[y][x][0] = id;

       // Atualiza a fonte da imagem HTML para refletir o novo ID.
       // document.images é uma coleção de todas as imagens no documento.
       // A imagem específica é identificada pelo nome no formato "p1Y_X".
       // id é usado para construir o nome do arquivo da imagem.
       // "img/navio" + id + ".gif" cria o caminho para o arquivo da imagem.
       document.images["p1" + y + "_" + x].src = "img/navio" + id + ".gif";
   } else {
       // Se não é o tabuleiro do jogador 1, então é o do jogador 2.
       // Atualiza a grade do jogador 2 com o novo ID.
       // 'id' representa o identificador da imagem que deve ser exibida.
       // player2[y][x][0] armazena o ID da imagem para a célula (y, x).
       player2[y][x][0] = id;

       // Atualiza a fonte da imagem HTML para refletir o novo ID.
       // document.images é uma coleção de todas as imagens no documento.
       // A imagem específica é identificada pelo nome no formato "p2Y_X".
       // id é usado para construir o nome do arquivo da imagem.
       // "img/navio" + id + ".gif" cria o caminho para o arquivo da imagem.
       document.images["p2" + y + "_" + x].src = "img/navio" + id + ".gif";
   }
}
/* Gera o HTML para exibir a grade do tabuleiro de um jogador. */
function showGrid(isPlayer1) {
    var y, x;
    // Obtém o elemento HTML onde o tabuleiro será exibido, baseado em qual jogador (player 1 ou player 2)
    var container = isPlayer1 ? document.getElementById("player1Grid") : document.getElementById("player2Grid");
    
    // Inicializa a string HTML que será usada para criar a grade do tabuleiro
    var gridHTML = '';
    
    // Loop através de cada linha do tabuleiro (eixo Y)
    for (y = 0; y < gridy; ++y) {
        // Loop através de cada coluna do tabuleiro (eixo X)
        for (x = 0; x < gridx; ++x) {
            // Define se o jogador atual pode clicar no tabuleiro com base em qual jogador está jogando
            // O jogador só pode clicar no tabuleiro do oponente
            var clickable = (isPlayer1 && currentPlayer === 2) || (!isPlayer1 && currentPlayer === 1);
            
            // Ação de clique padrão previne qualquer ação (sem clicar no próprio tabuleiro)
            var clickAction = 'javascript:void(0);';

            // Se o tabuleiro for do oponente, permite que o jogador clique
            if (clickable) {
                // O clique chama a função gridClick com as coordenadas Y e X do tabuleiro
                clickAction = 'javascript:gridClick(' + y + ',' + x + ')';
            }

            // Jogador 1 vê o tabuleiro do oponente (Jogador 2) e vice-versa
            if (isPlayer1) {
                // Exibe o tabuleiro do jogador 1, mas esconde os navios do jogador 2
                var imgSrc = player1[y][x][0]; // Obtém a imagem da posição atual do jogador 1
                
                // Se o jogador 2 está jogando e a célula do jogador 1 ainda não foi atingida (menor que 100), mostra água
                if (currentPlayer === 2 && player1[y][x][0] < 100) {
                    imgSrc = 100; // Mostra imagem de água (navio100.gif)
                }
                // Adiciona o link clicável ao HTML (ou não, se não for permitido clicar)
                gridHTML += '<a href="' + clickAction + '">';
                // Adiciona a imagem correspondente à célula do tabuleiro
                gridHTML += '<img name="p1' + y + '_' + x + '" src="navio' + imgSrc + '.gif" width=16 height=16></a>';
            } else {
                // Exibe o tabuleiro do jogador 2, mas esconde os navios do jogador 1
                var imgSrc = player2[y][x][0]; // Obtém a imagem da posição atual do jogador 2
                
                // Se o jogador 1 está jogando e a célula do jogador 2 ainda não foi atingida (menor que 100), mostra água
                if (currentPlayer === 1 && player2[y][x][0] < 100) {
                    imgSrc = 100; // Mostra imagem de água (navio100.gif)
                }
                // Adiciona o link clicável ao HTML (ou não, se não for permitido clicar)
                gridHTML += '<a href="' + clickAction + '">';
                // Adiciona a imagem correspondente à célula do tabuleiro
                gridHTML += '<img name="p2' + y + '_' + x + '" src="navio' + imgSrc + '.gif" width=16 height=16></a>';
            }
        }
        // Adiciona uma quebra de linha após cada linha do tabuleiro
        gridHTML += '<br>';
    }
    // Define o HTML gerado no container do tabuleiro (div do player 1 ou player 2)
    container.innerHTML = gridHTML;
}

/* Função para os cliques no plano cartesiano */
/* Processa o ataque de um jogador ao tabuleiro do outro jogador. */
function gridClick(y, x) {
   // Verifica se o jogador atual é o Jogador 1
   if (currentPlayer === 1) {
       // Jogador 1 ataca o tabuleiro do Jogador 2
       
       // Verifica se a célula clicada no tabuleiro do Jogador 2 não contém água
       if (player2[y][x][0] < 100) {
           // Atualiza a imagem na célula clicada para indicar um ataque bem-sucedido
           setImage(y, x, 103, false); // 103 representa um acerto
           
           // Obtém o número do navio na célula clicada
           var shipNo = player2[y][x][1];
           
           // Decrementa a vida do navio
           if (--player2Ships[shipNo][1] === 0) {
               // Se o navio foi afundado, chama a função sinkShip para afundar o navio
               sinkShip(player2, shipNo, false);
               
               // Atualiza e exibe o modal de notificação de afundamento de navio
               document.getElementById('modal_titulo').innerText = 'Navio Destruido';
               document.getElementById('modal_titulo_div').className = 'modal-header text-success';
               document.getElementById('modal_conteudo').innerText = "Jogador 1 afundou o " + shiptypes[player2Ships[shipNo][0]][0] + "!";
               document.getElementById('modal_btn').innerText = 'Voltar';
               document.getElementById('modal_btn').className = 'btn btn-success';
               $('#modalAlert').modal('show'); // Exibe o modal
              
               // Verifica se todos os navios do Jogador 2 foram destruídos
               if (--player2Lives === 0) {
                   alert("Jogador 1 venceu!"); // Exibe mensagem de vitória
                   currentPlayer = 0; // Define currentPlayer como 0 para indicar fim de jogo
               }
           }
           // Alterna o turno para o Jogador 2
           currentPlayer = 2;
       } else if (player2[y][x][0] === 100) {
           // Se a célula clicada contém água, atualiza a imagem para indicar um erro
           setImage(y, x, 102, false); // 102 representa um erro (acerto na água)
           
           // Alterna o turno para o Jogador 2
           currentPlayer = 2;
       }
   } else if (currentPlayer === 2) {
       // Jogador 2 ataca o tabuleiro do Jogador 1
       
       // Verifica se a célula clicada no tabuleiro do Jogador 1 não contém água
       if (player1[y][x][0] < 100) {
           // Atualiza a imagem na célula clicada para indicar um ataque bem-sucedido
           setImage(y, x, 103, true); // 103 representa um acerto
           
           // Obtém o número do navio na célula clicada
           var shipNo = player1[y][x][1];
           
           // Decrementa a vida do navio
           if (--player1Ships[shipNo][1] === 0) {
               // Se o navio foi afundado, chama a função sinkShip para afundar o navio
               sinkShip(player1, shipNo, true);
               
               // Atualiza e exibe o modal de notificação de afundamento de navio
               document.getElementById('modal_titulo').innerText = 'Navio Destruido';
               document.getElementById('modal_titulo_div').className = 'modal-header text-success';
               document.getElementById('modal_conteudo').innerText = "Jogador 2 afundou o " + shiptypes[player1Ships[shipNo][0]][0] + "!";
               document.getElementById('modal_btn').innerText = 'Voltar';
               document.getElementById('modal_btn').className = 'btn btn-success';
               $('#modalAlert').modal('show'); // Exibe o modal
               
               // Verifica se todos os navios do Jogador 1 foram destruídos
               if (--player1Lives === 0) {
                   alert("Jogador 2 venceu!"); // Exibe mensagem de vitória
                   currentPlayer = 0; // Define currentPlayer como 0 para indicar fim de jogo
               }
           }
           // Alterna o turno para o Jogador 1
           currentPlayer = 1;
       } else if (player1[y][x][0] === 100) {
           // Se a célula clicada contém água, atualiza a imagem para indicar um erro
           setImage(y, x, 102, true); // 102 representa um erro (acerto na água)
           
           // Alterna o turno para o Jogador 1
           currentPlayer = 1;
       }
   }

   // Atualiza a mensagem de status do jogo
   updateStatus();
   
   // Atualiza os tabuleiros para o jogador atual e o oponente
   showGrid(currentPlayer === 1); 
   showGrid(currentPlayer === 2); // Atualiza o tabuleiro do oponente para ambos os jogadores
}

/* Quando um navio todo for acertado, mostrar outra imagem */
/* Atualiza o tabuleiro para mostrar a representação de um navio afundado. */
function sinkShip(grid, shipNo, isPlayer1) {
   var y, x;  // Declara variáveis para iteração sobre as células do tabuleiro
   
   // Itera sobre cada célula da grade (tabuleiro)
   for (y = 0; y < gridx; ++y) { // Loop para percorrer as linhas do tabuleiro
       for (x = 0; x < gridx; ++x) { // Loop para percorrer as colunas do tabuleiro
           
           // Verifica se a célula contém o navio especificado pelo número shipNo
           if (grid[y][x][1] === shipNo) {
               
               // Se o navio é do Jogador 1
               if (isPlayer1) {
                   // Atualiza a imagem da célula para mostrar a parte afundada do navio do Jogador 1
                   setImage(y, x, player1[y][x][2], true);
               } else {
                   // Se o navio é do Jogador 2
                   // Atualiza a imagem da célula para mostrar a parte afundada do navio do Jogador 2
                   setImage(y, x, player2[y][x][2], false);
               }
           }
       }
   }
}


/* Mostra quantos navios o jogador inimigo ainda tem */
/* Atualiza a mensagem de status para indicar o jogador atual. */
function updateStatus() {
   var i, s;  // Declara variáveis para controle e mensagem
   
   // Determina a mensagem de status com base no jogador atual
   if (currentPlayer === 1) {
       // Se o Jogador 1 está com a vez
       s = "Vez do Jogador 1";
   } else if (currentPlayer === 2) {
       // Se o Jogador 2 está com a vez
       s = "Vez do Jogador 2";
   } else {
       // Caso não seja nem o Jogador 1 nem o Jogador 2 (por exemplo, fim do jogo)
       s = "";
   }
   
   // Atualiza o conteúdo do elemento HTML com a mensagem de status
   document.getElementById("statusMessage").textContent = s;
}

/* Inicia o jogo */
/* Precarrega as imagens, configura os tabuleiros para os jogadores e exibe o status inicial. */
imagePreload();
player1 = setupPlayer(true);
player2 = setupPlayer(false);

showGrid(true);  // Inicializa o tabuleiro do jogador 1
showGrid(false); // Inicializa o tabuleiro do jogador 2

updateStatus();
setInterval(updateStatus, 500); // Atualiza a mensagem de status a cada 500 ms


//a

function restartGame() {
  // Reiniciar os estados dos jogadores
  player1 = setupPlayer(true);
  player2 = setupPlayer(false);

  player1Lives = player1Ships.length;
  player2Lives = player2Ships.length;

  currentPlayer = 1; // Definir o jogador 1 como o inicial

  // Atualizar os tabuleiros
  showGrid(true);
  showGrid(false);

  // Atualizar a mensagem de status e o placar
  updateStatus();
  updateScore();

  // Fechar o modal, caso esteja aberto
  $('#modalAlert').modal('hide');
}

/* Função para atualizar o placar */
function updateScore() {
  document.getElementById("player1Score").textContent = player1Lives;
  document.getElementById("player2Score").textContent = player2Lives;
}

/* Modifique a função gridClick para chamar updateScore após um turno */
function gridClick(y, x) {
  if (currentPlayer === 1) {
    // Jogador 1 ataca o tabuleiro do Jogador 2
    if (player2[y][x][0] < 100) {
      setImage(y, x, 103, false); // Ataque bem-sucedido
      var shipNo = player2[y][x][1];
      if (--player2Ships[shipNo][1] === 0) {
        sinkShip(player2, shipNo, false); // Afunda navio
        document.getElementById('modal_titulo').innerText = 'Navio Destruido';
        document.getElementById('modal_titulo_div').className = 'modal-header text-success';
        document.getElementById('modal_conteudo').innerText = "Jogador 1 afundou o " + shiptypes[player2Ships[shipNo][0]][0] + "!";
        document.getElementById('modal_btn').innerText = 'Voltar';
        document.getElementById('modal_btn').className = 'btn btn-success';
        $('#modalAlert').modal('show'); // Exibe o modal
        if (--player2Lives === 0) {
          alert("Jogador 1 venceu!");
          currentPlayer = 0; // Fim de jogo
        }
      }
      currentPlayer = 2; // Alterna turno
    } else if (player2[y][x][0] === 100) {
      setImage(y, x, 102, false); // Acerta a água
      currentPlayer = 2; // Alterna turno
    }
  } else if (currentPlayer === 2) {
    // Jogador 2 ataca o tabuleiro do Jogador 1
    if (player1[y][x][0] < 100) {
      setImage(y, x, 103, true); // Ataque bem-sucedido
      var shipNo = player1[y][x][1];
      if (--player1Ships[shipNo][1] === 0) {
        sinkShip(player1, shipNo, true); // Afunda navio
        document.getElementById('modal_titulo').innerText = 'Navio Destruido';
        document.getElementById('modal_titulo_div').className = 'modal-header text-success';
        document.getElementById('modal_conteudo').innerText = "Jogador 2 afundou o " + shiptypes[player1Ships[shipNo][0]][0] + "!";
        document.getElementById('modal_btn').innerText = 'Voltar';
        document.getElementById('modal_btn').className = 'btn btn-success';
        $('#modalAlert').modal('show'); // Exibe o modal
        if (--player1Lives === 0) {
          alert("Jogador 2 venceu!");
          currentPlayer = 0; // Fim de jogo
        }
      }
      currentPlayer = 1; // Alterna turno
    } else if (player1[y][x][0] === 100) {
      setImage(y, x, 102, true); // Acerta a água
      currentPlayer = 1; // Alterna turno
    }
  }

  updateStatus(); // Atualiza a mensagem de status
  updateScore();  // Atualiza o placar
  showGrid(currentPlayer === 1); 
  showGrid(currentPlayer === 2);
}

/* Atualiza o placar ao iniciar o jogo */
updateScore();