let compromissos = [];
let materiaAtiva = 'Matemática';

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
        materia: materiaAtiva,
        titulo: titulo,
        prazo: dataPrazo.getTime() 
    };

    compromissos.push(novoCompromisso);
    document.getElementById('agenda-form').reset();

    renderizarCompromissos();
});

// Troca de matéria
function mudarMateria(novaMateria, botaoClicado) {
    materiaAtiva = novaMateria;
    document.getElementById('materia-titulo').innerText = novaMateria;

    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(btn => btn.classList.remove('active'));

    botaoClicado.classList.add('active');
    document.getElementById('agenda-form').reset();

    renderizarCompromissos();
}

// NOVA FUNÇÃO: Remove o compromisso do array pelo ID
function excluirCompromisso(id) {
    // Filtra o array mantendo apenas os compromissos que têm o ID DIFERENTE do que queremos deletar
    compromissos = compromissos.filter(c => c.id !== id);
    
    // Atualiza a tela para sumir com o card deletado
    renderizarCompromissos();
}

// Renderiza os compromissos na tela
function renderizarCompromissos() {
    const listaContainer = document.getElementById('lista-compromissos');
    listaContainer.innerHTML = ''; 

    const filtrados = compromissos.filter(c => c.materia === materiaAtiva);

    if (filtrados.length === 0) {
        listaContainer.innerHTML = '<p style="color: #777;">Nenhum trabalho ou prova agendada para esta matéria.</p>';
        return;
    }

    filtrados.forEach(c => {
        const card = document.createElement('div');
        card.classList.add('card');

        const tempoRestanteTexto = calcularTempoRestante(c.prazo);

        // Adicionado o botão "Excluir" que chama a função de exclusão passando o ID único do card
        card.innerHTML = `
            <div class="card-info">
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

// Calcula o tempo restante
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

// Loop contínuo do cronômetro
setInterval(function() {
    const filtrados = compromissos.filter(c => c.materia === materiaAtiva);

    filtrados.forEach(c => {
        const elementoTimer = document.getElementById(`timer-${c.id}`);
        if (elementoTimer) {
            elementoTimer.innerText = calcularTempoRestante(c.prazo);
        }
    });
}, 1000);