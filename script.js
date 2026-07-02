// Carrega os dados salvos do localStorage logo ao iniciar. Se não houver nada, começa com array vazio.
let compromissos = JSON.parse(localStorage.getItem('agenda_escolar_dados')) || [];

// Começamos na aba "Geral" por padrão para exibir o resumo completo
let materiaAtiva = 'Geral';

// Roda assim que a página carrega pela primeira vez para exibir os dados salvos
document.addEventListener('DOMContentLoaded', () => {
    renderizarCompromissos();
});

// Monitora o envio do formulário de cadastro
document.getElementById('agenda-form').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const titulo = document.getElementById('titulo').value;
    const dataInput = document.getElementById('data').value; 
    const horaInput = document.getElementById('hora').value; 

    const [ano, mes, dia] = dataInput.split('-');
    const [horas, minutos] = horaInput.split(':');
    
    const dataPrazo = new Date(ano, mes - 1, dia, horas, minutos, 0);

    const novoCompromisso = {
        id: Date.now(), 
        materia: materiaAtiva, // Vincula à matéria que está aberta na tela
        titulo: titulo,
        prazo: dataPrazo.getTime() 
    };

    compromissos.push(novoCompromisso);
    
    // SALVA NO LOCALSTORAGE
    salvarNoNavegador();

    document.getElementById('agenda-form').reset();
    renderizarCompromissos();
});

// Troca de página/matéria
function mudarMateria(novaMateria, botaoClicado) {
    materiaAtiva = novaMateria;
    document.getElementById('materia-titulo').innerText = novaMateria;

    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => btn.classList.remove('active'));
    botaoClicado.classList.add('active');

    const secaoForm = document.getElementById('secao-formulario');
    const avisoGeral = document.getElementById('aviso-cadastro-geral');

    // Regra: Se estiver na aba 'Geral', esconde o formulário (não faz sentido cadastrar algo sem matéria definida)
    if (novaMateria === 'Geral') {
        secaoForm.style.display = 'none';
        avisoGeral.style.display = 'block';
    } else {
        secaoForm.style.display = 'block';
        avisoGeral.style.display = 'none';
    }

    if(document.getElementById('agenda-form')) {
        document.getElementById('agenda-form').reset();
    }

    renderizarCompromissos();
}

// Remove o compromisso e atualiza o banco de dados local
function excluirCompromisso(id) {
    compromissos = compromissos.filter(c => c.id !== id);
    
    // ATUALIZA O SALVAMENTO NO LOCALSTORAGE
    salvarNoNavegador();
    renderizarCompromissos();
}

// Função responsável por persistir os dados no navegador do usuário
function salvarNoNavegador() {
    localStorage.setItem('agenda_escolar_dados', JSON.stringify(compromissos));
}

// Renderiza os compromissos de forma inteligente (Filtra por matéria ou mostra Tudo)
function renderizarCompromissos() {
    const listaContainer = document.getElementById('lista-compromissos');
    listaContainer.innerHTML = ''; 

    // SE for 'Geral', pega todos os compromissos. SE NÃO, filtra pela matéria ativa.
    const filtrados = (materiaAtiva === 'Geral') 
        ? compromissos 
        : compromissos.filter(c => c.materia === materiaAtiva);

    // Organiza por ordem de prazo mais próximo primeiro
    filtrados.sort((a, b) => a.prazo - b.prazo);

    if (filtrados.length === 0) {
        listaContainer.innerHTML = `<p style="color: #777; margin-top: 10px;">Nenhum trabalho ou prova pendente aqui.</p>`;
        return;
    }

    filtrados.forEach(c => {
        const card = document.createElement('div');
        card.classList.add('card');

        const tempoRestanteTexto = calcularTempoRestante(c.prazo);

        // Se for a aba Geral, mostramos uma etiqueta (badge) com o nome da matéria no card
        const badgeMateriaHTML = (materiaAtiva === 'Geral') 
            ? `<span class="badge-materia" style="background-color: #eef2ff; color: #4f46e5;">${c.materia}</span>` 
            : '';

        card.innerHTML = `
            <div class="card-info">
                ${badgeMateriaHTML}
                <h4>${c.titulo}</h4>
                <small>Prazo: ${new Date(c.prazo).toLocaleString('pt-BR')}</small>
            </div>
            <div class="card-acoes">
                <div class="countdown" id="timer-${c.id}">${tempoRestanteTexto}</div>
                <button class="btn-deletar" onclick="excluirCompromisso(${c.id})">Excluir</button>
            </div>
        `;

        listaContainer.appendChild(card);
    });
}

// Lógica do cronômetro
function calcularTempoRestante(prazo) {
    const agora = new Date().getTime();
    const diferenca = prazo - agora;

    if (diferenca <= 0) {
        return "Tempo esgotado! 🚨";
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
}

// Loop contínuo que atualiza os cronômetros na tela a cada 1 segundo
setInterval(function() {
    // Determina quais itens estão visíveis na tela no momento para atualizar o timer correto
    const filtrados = (materiaAtiva === 'Geral') 
        ? compromissos 
        : compromissos.filter(c => c.materia === materiaAtiva);

    filtrados.forEach(c => {
        const elementoTimer = document.getElementById(`timer-${c.id}`);
        if (elementoTimer) {
            elementoTimer.innerText = calcularTempoRestante(c.prazo);
        }
    });
}, 1000);