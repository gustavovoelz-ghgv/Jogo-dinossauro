/* ============================================================
   ARQUIVO: jogo.js
   Descrição: Jogo do Dinossauro Completo
   - Pulo e Queda Ultra Rápida ao agachar no ar
   - Agachamento perfeito no chão
   - Recorde salvo no LocalStorage
   - Cactos em sequência e Nuvens
   ============================================================ */

const canvas = document.getElementById("telaDoJogo");
const ctx = canvas.getContext("2d");

const alturaDoChao = 250;

// Estado do Jogo
let gameOver = false;

// Configurações de Pontuação e Velocidade
let pontos = 0;
let recorde = localStorage.getItem("dinoRecorde") ? parseFloat(localStorage.getItem("dinoRecorde")) : 0;
let velocidadeJogo = 6;
const velocidadeMaxima = 16;

// Objeto do Dinossauro
const dino = {
    x: 50,
    y: alturaDoChao - 40,
    larguraPadrao: 40,
    alturaPadrao: 40,
    larguraAgachado: 55,
    alturaAgachado: 25,
    largura: 40,
    altura: 40,
    velocidadeY: 0,
    gravidadeNormal: 0.8,
    gravidadeRapida: 5.0, // Gravidade ultra forte ao agachar no ar
    gravidade: 0.8,
    forcaDoPulo: -12,
    estaNoChao: true,
    estaAgachado: false
};

// Configuração dos Cactos
let cactos = [];
let tempoParaProximoCacto = 0;

// Configuração das Nuvens
let nuvens = [];
let tempoParaProximaNuvem = 0;

function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ------------------------------------------------------------
// PONTUAÇÃO E VELOCIDADE
// ------------------------------------------------------------
function atualizarPontuacao() {
    pontos += 0.2;

    if (velocidadeJogo < velocidadeMaxima) {
        velocidadeJogo = 6 + (pontos / 150);
    }
}

function desenharPontos() {
    ctx.fillStyle = "#535353";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "right";

    const pontosFormatados = String(Math.floor(pontos)).padStart(5, '0');
    const recordeFormatado = String(Math.floor(recorde)).padStart(5, '0');

    if (recorde > 0) {
        ctx.fillText(`HI ${recordeFormatado}  ${pontosFormatados}`, canvas.width - 20, 35);
    } else {
        ctx.fillText(pontosFormatados, canvas.width - 20, 35);
    }
}

// ------------------------------------------------------------
// NUVENS
// ------------------------------------------------------------
function criarNuvem() {
    const alturaNuvem = numeroAleatorio(30, 100);

    const novaNuvem = {
        x: canvas.width,
        y: alturaNuvem,
        largura: 50,
        altura: 18,
        velocidade: 1.5
    };

    nuvens.push(novaNuvem);
    tempoParaProximaNuvem = numeroAleatorio(120, 240);
}

function atualizarNuvens() {
    tempoParaProximaNuvem--;

    if (tempoParaProximaNuvem <= 0) {
        criarNuvem();
    }

    for (let i = 0; i < nuvens.length; i++) {
        const nuvem = nuvens[i];
        nuvem.x -= nuvem.velocidade;

        if (nuvem.x + nuvem.largura < 0) {
            nuvens.splice(i, 1);
            i--;
        }
    }
}

function desenharNuvens() {
    ctx.fillStyle = "#d0d0d0";

    for (let i = 0; i < nuvens.length; i++) {
        const n = nuvens[i];
        ctx.fillRect(n.x, n.y + 6, n.largura, n.altura - 6);
        ctx.fillRect(n.x + 10, n.y, n.largura - 20, n.altura);
        ctx.fillRect(n.x + 25, n.y - 4, 12, n.altura);
    }
}

// ------------------------------------------------------------
// CACTOS
// ------------------------------------------------------------
function criarCacto() {
    const ehDupla = Math.random() < 0.3;
    const quantidade = ehDupla ? 2 : 1;

    for (let i = 0; i < quantidade; i++) {
        const alturaSorteada = numeroAleatorio(35, 50);

        const novoCacto = {
            x: canvas.width + (i * 28),
            y: alturaDoChao - alturaSorteada,
            largura: 24,
            altura: alturaSorteada
        };

        cactos.push(novoCacto);
    }

    const fatorVelocidade = 6 / velocidadeJogo;
    tempoParaProximoCacto = (ehDupla ? numeroAleatorio(110, 160) : numeroAleatorio(75, 130)) * fatorVelocidade;
}

function atualizarCactos() {
    tempoParaProximoCacto--;

    if (tempoParaProximoCacto <= 0) {
        criarCacto();
    }

    for (let i = 0; i < cactos.length; i++) {
        const cacto = cactos[i];
        cacto.x -= velocidadeJogo;

        if (cacto.x + cacto.largura < 0) {
            cactos.splice(i, 1);
            i--;
        }
    }
}

function desenharCactos() {
    for (let i = 0; i < cactos.length; i++) {
        const c = cactos[i];

        // Tronco Principal
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(c.x + 7, c.y, 10, c.altura);

        // Detalhe de luz
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(c.x + 9, c.y + 2, 3, c.altura - 4);

        // Braço Esquerdo
        if (c.altura > 38) {
            ctx.fillStyle = "#2e7d32";
            ctx.fillRect(c.x, c.y + 12, 7, 12);
            ctx.fillRect(c.x, c.y + 20, 10, 4);

            ctx.fillStyle = "#4caf50";
            ctx.fillRect(c.x + 2, c.y + 14, 2, 8);
        }

        // Braço Direito
        ctx.fillStyle = "#2e7d32";
        ctx.fillRect(c.x + 17, c.y + 16, 7, 12);
        ctx.fillRect(c.x + 14, c.y + 24, 10, 4);

        ctx.fillStyle = "#4caf50";
        ctx.fillRect(c.x + 19, c.y + 18, 2, 8);
    }
}

// ------------------------------------------------------------
// DINOSSAURO (PULO E AGACHAR)
// ------------------------------------------------------------
function desenharDino() {
    const x = dino.x;
    const y = dino.y;

    ctx.fillStyle = "#535353";

    if (dino.estaAgachado) {
        // Corpo esticado
        ctx.fillRect(x + 5, y + 5, 38, 13);

        // Cabeça abaixada à frente
        ctx.fillRect(x + 35, y + 2, 18, 10);

        // Olho
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 44, y + 3, 3, 3);
        ctx.fillStyle = "#000000";
        ctx.fillRect(x + 45, y + 4, 2, 2);

        ctx.fillStyle = "#535353";

        // Focinho
        ctx.fillRect(x + 48, y + 6, 7, 5);

        // Rabo
        ctx.fillRect(x, y + 6, 7, 5);

        // Pernas
        ctx.fillRect(x + 12, y + 16, 6, 9);
        ctx.fillRect(x + 28, y + 16, 6, 9);

    } else {
        // Corpo
        ctx.fillRect(x + 5, y + 15, 20, 18);

        // Cabeça
        ctx.fillRect(x + 15, y, 18, 14);

        // Olho
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + 24, y + 3, 4, 4);
        ctx.fillStyle = "#000000";
        ctx.fillRect(x + 26, y + 4, 2, 2);

        ctx.fillStyle = "#535353";

        // Focinho
        ctx.fillRect(x + 25, y + 8, 10, 6);

        // Rabo
        ctx.fillRect(x, y + 20, 6, 6);

        // Braço
        ctx.fillRect(x + 22, y + 18, 5, 3);

        // Pernas
        ctx.fillRect(x + 8, y + 33, 5, 7);
        ctx.fillRect(x + 18, y + 33, 5, 7);
    }
}

function desenharChao() {
    ctx.beginPath();
    ctx.moveTo(0, alturaDoChao);
    ctx.lineTo(canvas.width, alturaDoChao);
    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function atualizarDino() {
    // Altera o tamanho dependendo de estar agachado ou em pé
    if (dino.estaAgachado) {
        dino.largura = dino.larguraAgachado;
        dino.altura = dino.alturaAgachado;
    } else {
        dino.largura = dino.larguraPadrao;
        dino.altura = dino.alturaPadrao;
    }

    // Aplica a gravidade forte se estiver agachado no ar
    if (!dino.estaNoChao) {
        dino.gravidade = dino.estaAgachado ? dino.gravidadeRapida : dino.gravidadeNormal;
        dino.velocidadeY += dino.gravidade;
        dino.y += dino.velocidadeY;
    } else {
        // Mantém firme no chão
        dino.y = alturaDoChao - dino.altura;
    }

    // Teste de toque no chão
    if (dino.y + dino.altura >= alturaDoChao) {
        dino.y = alturaDoChao - dino.altura;
        dino.velocidadeY = 0;
        dino.estaNoChao = true;
    }
}

function pular() {
    if (dino.estaNoChao && !dino.estaAgachado) {
        dino.velocidadeY = dino.forcaDoPulo;
        dino.estaNoChao = false;
    }
}

// ------------------------------------------------------------
// CONTROLES DE TECLADO
// ------------------------------------------------------------
window.addEventListener("keydown", function(evento) {
    if (["Space", "ArrowUp", "ArrowDown", "KeyS"].includes(evento.code)) {
        evento.preventDefault();
    }

    if (evento.code === "Space" || evento.code === "ArrowUp") {
        if (gameOver) {
            reiniciarJogo();
        } else {
            pular();
        }
    }

    if (evento.code === "ArrowDown" || evento.code === "KeyS") {
        if (!gameOver) {
            dino.estaAgachado = true;
            
            // Se estiver no ar, força um empurrão rápido para baixo na hora!
            if (!dino.estaNoChao && dino.velocidadeY < 12) {
                dino.velocidadeY = 12;
            }
        }
    }
});

window.addEventListener("keyup", function(evento) {
    if (["ArrowDown", "KeyS"].includes(evento.code)) {
        dino.estaAgachado = false;
    }
});

// ------------------------------------------------------------
// COLISÃO E GAME OVER
// ------------------------------------------------------------
function verificarColisao() {
    for (let i = 0; i < cactos.length; i++) {
        const cacto = cactos[i];
        const margem = 5;

        if (
            dino.x + dino.largura - margem > cacto.x &&
            dino.x + margem < cacto.x + cacto.largura &&
            dino.y + dino.altura - margem > cacto.y &&
            dino.y + margem < cacto.y + cacto.altura
        ) {
            gameOver = true;

            if (pontos > recorde) {
                recorde = pontos;
                localStorage.setItem("dinoRecorde", recorde);
            }
        }
    }
}

function desenharGameOver() {
    ctx.fillStyle = "#333333";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText("Aperte espaço para reiniciar o jogo", canvas.width / 2, canvas.height / 2 + 25);
}

function reiniciarJogo() {
    cactos = [];
    nuvens = [];
    dino.estaAgachado = false;
    dino.largura = dino.larguraPadrao;
    dino.altura = dino.alturaPadrao;
    dino.y = alturaDoChao - dino.altura;
    dino.velocidadeY = 0;
    dino.estaNoChao = true;
    tempoParaProximoCacto = 0;
    tempoParaProximaNuvem = 0;
    
    pontos = 0;
    velocidadeJogo = 6;
    
    gameOver = false;
    loopDoJogo();
}

// ------------------------------------------------------------
// LOOP PRINCIPAL
// ------------------------------------------------------------
function loopDoJogo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        atualizarDino();
        atualizarNuvens();
        atualizarCactos();
        atualizarPontuacao();

        verificarColisao();

        desenharNuvens();
        desenharChao();
        desenharDino();
        desenharCactos();
        desenharPontos();

        requestAnimationFrame(loopDoJogo);
    } else {
        desenharNuvens();
        desenharChao();
        desenharDino();
        desenharCactos();
        desenharPontos();
        desenharGameOver();
    }
}

loopDoJogo();