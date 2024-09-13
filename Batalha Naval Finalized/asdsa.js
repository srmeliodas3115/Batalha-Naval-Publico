/* Informação usada para desenhar os navios */
var ship =  [[[1,5], [1,2,5], [1,2,3,5], [1,2,3,4,5]], [[6,10], [6,7,10], [6,7,8,10], [6,7,8,9,10]]];
/* Informação usada para desenhar os navios afundados */
var dead = [[[201,203], [201,202,203], [201,202,202,203], [201,202,202,202,203]], [[204,206], [204,205,206], [204,205,205,206], [204,205,205,205,206]]];
/* Descrição dos navios */
var shiptypes = [["Rebocador",2,4],["Contratopedeiro",3,4],[ "Cruzador",4,2],[ "Porta-avioes",5,1]];

var gridx = 16, gridy = 16; // Dimensões do tabuleiro
var player = [], computer = [], playersships = [], computersships = []; // Dados dos tabuleiros e navios
var playerlives = 0, computerlives = 0; // Contador de vidas dos jogadores
var playflag = true; // Flag para controle do estado do jogo
var statusmsg = ""; // Mensagem de status

/* Função para precarregar as imagens */
var preloaded = []; // Array para armazenar imagens carregadas

function imagePreload() {
  var i, ids = [1,2,3,4,5,6,7,8,9,10,100,101,102,103,201,202,203,204,205,206]; // IDs das imagens
  window.status = "Precarregando as imagens."; // Mensagem de status
  for (i = 0; i < ids.length; ++i) {
    var img = new Image, name = "navio" + ids[i] + ".gif"; // Nome do arquivo da imagem
    img.src = name;
    preloaded[i] = img; // Armazena a imagem no array
  }
  window.status = ""; // Remove a mensagem de status
}

/* Função para colocar os navios nos quadrados */
function setupPlayer(ispc) {
  var y, x;
  grid = [];
  for (y = 0; y < gridx; ++y) {
    grid[y] = [];
    for (x = 0; x < gridx; ++x)
      grid[y][x] = [100, -1, 0]; // Inicializa o tabuleiro com valores padrão
  }
  var shipno = 0;
  var s;
  for (s = shiptypes.length - 1; s >= 0; --s) {
    var i;
    for (i = 0; i < shiptypes[s][2]; ++i) {
      var d = Math.floor(Math.random() * 2); // Determina a direção do navio
      var len = shiptypes[s][1], lx = gridx, ly = gridy, dx = 0, dy = 0;
      if (d == 0) {
        lx = gridx - len;
        dx = 1;
      } else {""
        ly = gridy - len;
        dy = 1;
      }
      var x, y, ok;
      do {
        y = Math.floor(Math.random() * ly); // Escolhe posição aleatória
        x = Math.floor(Math.random() * lx);
        var j, cx = x, cy = y;
        ok = true;
        for (j = 0; j < len; ++j) {
          if (grid[cy][cx][0] < 100) {
            ok = false;
            break;
          }
          cx += dx;
          cy += dy;
        }
      } while (!ok); // Verifica se a posição é válida
      var j, cx = x, cy = y;
      for (j = 0; j < len; ++j) {
        grid[cy][cx][0] = ship[d][s][j]; // Define a posição do navio
        grid[cy][cx][1] = shipno;
        grid[cy][cx][2] = dead[d][s][j];
        cx += dx;
        cy += dy;
      }
      if (ispc) {
        computersships[shipno] = [s, shiptypes[s][1]];
        computerlives++;
      } else {
        playersships[shipno] = [s, shiptypes[s][1]];
        playerlives++;
      }
      shipno++;
    }
  }
  return grid; // Retorna o tabuleiro configurado
}

/* Função para mudar as imagens nos quadrados */
function setImage(y, x, id, ispc) {
  if (ispc) {
    computer[y][x][0] = id;
    document.images["pc" + y + "_" + x].src = "navio" + id + ".gif"; // Atualiza a imagem do computador
  } else {
    player[y][x][0] = id;
    document.images["ply" + y + "_" + x].src = "navio" + id + ".gif"; // Atualiza a imagem do jogador
  }
}

/* Função para desenhar o plano cartesiano */
function showGrid(ispc) {
  var y, x;
  for (y = 0; y < gridy; ++y) {
    for (x = 0; x < gridx; ++x) {
      if (ispc)
        document.write('<a href="javascript:gridClick(' + y + ',' + x + ');"><img name="pc' + y + '_' + x + '" src="navio100.gif" width=30 height=30></a>'); // Exibe o tabuleiro do computador
      else
        document.write('<a href="javascript:void(0);"><img name="ply' + y + '_' + x + '" src="navio' + player[y][x][0] + '.gif" width=30 height=30></a>'); // Exibe o tabuleiro do jogador
    }
    document.write('<br>');
  }
}

/* Função para os cliques no plano cartesiano */
function gridClick(y, x) {
  if (playflag) {
    if (computer[y][x][0] < 100) {
      setImage(y, x, 103, true); // Marca um acerto
      var shipno = computer[y][x][1];
      if (--computersships[shipno][1] == 0) {
        sinkShip(computer, shipno, true); // Afunda o navio
          document.getElementById('modal_titulo').innerText = 'Navio Destruido';
          document.getElementById('modal_titulo_div').className = 'modal-header text-success';
          document.getElementById('modal_conteudo').innerText = "Voce afundou meu " + shiptypes[computersships[shipno][0]][0] + "!";
          document.getElementById('modal_btn').innerText = 'Voltar';
          document.getElementById('modal_btn').className = 'btn btn-success';
          $('#modalAlert').modal('show'); // Exibe o modal
        updateStatus();
        if (--computerlives == 0) {
          alert("Voce venceu! Aperte o F5\n" + "no seu navegador para jogar novamente.");
          playflag = false; // Finaliza o jogo
        }
      }
      if (playflag) computerMove(); // Realiza a jogada do computador
    } else if (computer[y][x][0] == 100) {
      setImage(y, x, 102, true); // Marca um erro
      computerMove(); // Realiza a jogada do computador
    }
  }
}


/* Função do AI do computador */
function computerMove() {
    var x, y, pass;
    var sx, sy;
    var selected = false;
  
    /* Faz duas jogadas perto uma da outra */
    for (pass = 0; pass < 2; ++pass) { 
      // Passo 0: tenta encontrar duas explosões consecutivas para atirar na mesma linha ou coluna
      // Passo 1: tenta atacar em volta de uma explosão isolada
      for (y = 0; y < gridy && !selected; ++y) { 
        for (x = 0; x < gridx && !selected; ++x) {
          /* Verifica se há uma explosão nessa posição (indica que já acertou um navio) */
          if (player[y][x][0] == 103) { 
            sx = x; sy = y;
            // Verifica os espaços adjacentes (cima, baixo, esquerda, direita) se estão disponíveis
            var nup = (y > 0 && player[y - 1][x][0] <= 100); 
            var ndn = (y < gridy - 1 && player[y + 1][x][0] <= 100);
            var nlt = (x > 0 && player[y][x - 1][0] <= 100);
            var nrt = (x < gridx - 1 && player[y][x + 1][0] <= 100);
            
            if (pass == 0) {
              /* Verifica se há duas explosões consecutivas e tenta atacar nessa linha ou coluna */
              var yup = (y > 0 && player[y - 1][x][0] == 103);
              var ydn = (y < gridy - 1 && player[y + 1][x][0] == 103);
              var ylt = (x > 0 && player[y][x - 1][0] == 103);
              var yrt = (x < gridx - 1 && player[y][x + 1][0] == 103);
              if (nlt && yrt) { sx = x - 1; selected = true; } // Atira para a esquerda
              else if (nrt && ylt) { sx = x + 1; selected = true; } // Atira para a direita
              else if (nup && ydn) { sy = y - 1; selected = true; } // Atira para cima
              else if (ndn && yup) { sy = y + 1; selected = true; } // Atira para baixo
            } else {
              /* Atira ao redor de uma parte atingida */
              if (nlt) { sx = x - 1; selected = true; } // Atira para a esquerda
              else if (nrt) { sx = x + 1; selected = true; } // Atira para a direita
              else if (nup) { sy = y - 1; selected = true; } // Atira para cima
              else if (ndn) { sy = y + 1; selected = true; } // Atira para baixo
            }
          }
        }
      }
    }
    
    if (!selected) {
      /* Se não encontrar explosões, escolhe uma posição aleatória no tabuleiro */
      do {
        sy = Math.floor(Math.random() * gridy); // Escolhe uma linha aleatória
        sx = Math.floor(Math.random() * gridx / 2) * 2 + sy % 2; // Escolhe uma coluna aleatória em um padrão alternado
      } while (player[sy][sx][0] > 100); // Garante que o quadrado não foi atingido anteriormente
    }
    
    if (player[sy][sx][0] < 100) {
      /* Se atingir um navio, atualiza a imagem e verifica se o navio foi destruído */
      setImage(sy, sx, 103, false); // Atualiza a imagem para indicar que o navio foi atingido
      var shipno = player[sy][sx][1]; // Obtém o número do navio
      if (--playersships[shipno][1] == 0) {
        sinkShip(player, shipno, false); // Afunda o navio se todos os quadrados dele foram atingidos
        document.getElementById('modal_titulo').innerText = 'Navio Destruido'; // Atualiza o modal para mostrar que um navio foi destruído
        document.getElementById('modal_titulo_div').className = 'modal-header text-danger';
        document.getElementById('modal_conteudo').innerText = "Eu afundei seu " + shiptypes[playersships[shipno][0]][0] + "!"; // Mensagem indicando qual navio foi destruído
        document.getElementById('modal_btn').innerText = 'Voltar';
        document.getElementById('modal_btn').className = 'btn btn-danger';
        $('#modalAlert').modal('show'); // Exibe o modal
  
        if (--playerlives == 0) { 
          // Se todas as vidas do jogador forem eliminadas, o computador vence
          knowYourEnemy(); // Mostra os navios restantes do computador no tabuleiro do jogador
          alert("Eu venci! Aperte o F5\n" + "no seu navegador para jogar novamente."); // Mensagem de vitória
          playflag = false; // Finaliza o jogo
        }
      }
    } else {
      /* Se errar o tiro, atualiza a imagem para indicar um erro */
      setImage(sy, sx, 102, false);
    }
  }
  
  /* Quando um navio for completamente atingido, atualiza todas as imagens relacionadas a ele */
  function sinkShip(grid, shipno, ispc) {
    var y, x;
    for (y = 0; y < gridx; ++y) {
      for (x = 0; x < gridx; ++x) {
        if (grid[y][x][1] == shipno) {
          if (ispc) setImage(y, x, computer[y][x][2], true); // Atualiza as imagens dos navios afundados no tabuleiro do computador
          else setImage(y, x, player[y][x][2], false); // Atualiza as imagens dos navios afundados no tabuleiro do jogador
        }
      }
    }
  }
  
  /* Função para mostrar os navios restantes do computador quando o jogador perde */
  function knowYourEnemy() {
    var y, x;
    for (y = 0; y < gridx; ++y) {
      for (x = 0; x < gridx; ++x) {
        if (computer[y][x][0] == 103)
          setImage(y, x, computer[y][x][2], true); // Mostra as partes afundadas do navio do computador
        else if (computer[y][x][0] < 100)
          setImage(y, x, computer[y][x][0], true); // Mostra os navios restantes do computador
      }
    }
  }
  
  /* Função para atualizar o status do jogo com os navios restantes do computador */
  function updateStatus() {
    var f = false, i, s = "O computador ";
    for (i = 0; i < computersships.length; ++i) {
      if (computersships[i][1] > 0) {
        if (f) s = s + ", "; else f = true;
        s = s + shiptypes[computersships[i][0]][0]; // Lista os navios restantes do computador
      }
    }
    if (!f) s = s + "não tem mais navios!"; // Se o computador não tiver mais navios
    statusmsg = s;
    window.status = statusmsg; // Atualiza a mensagem de status na barra do navegador
  }
  
  /* Função para definir o status do jogo */
  function setStatus() {
    window.status = statusmsg; // Define o status na barra do navegador
  }
  
  /* Inicia o jogo */
  imagePreload(); // Precarrega as imagens
  player = setupPlayer(false); // Configura o tabuleiro do jogador
  computer = setupPlayer(true); // Configura o tabuleiro do computador
  document.write("<center><table><tr><td align=center><p class='heading'>IA</p></td>"+
  "<td align=center><p class='heading'>SEU TABULEIRO</p></td></tr><tr><td>");
  showGrid(true); // Exibe o tabuleiro do computador
  document.write("</td><td>");
  showGrid(false); // Exibe o tabuleiro do jogador
  document.write("</td></tr></table></center>");
  updateStatus(); // Atualiza o status do jogo
  setInterval("setStatus();", 500); // Atualiza o status a cada 500 milissegundos