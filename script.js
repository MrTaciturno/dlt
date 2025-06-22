// Objeto para armazenar os dados do formulário
let dadosOficio = {};

// Função para converter números em texto por extenso
function numeroParaExtenso(numero) {
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    if (numero === 0) return 'zero';
    if (numero === 100) return 'cem';

    let resultado = '';

    // Centenas
    if (numero >= 100) {
        resultado += centenas[Math.floor(numero / 100)];
        numero %= 100;
        if (numero > 0) resultado += ' e ';
    }

    // Dezenas especiais (10-19)
    if (numero >= 10 && numero <= 19) {
        resultado += especiais[numero - 10];
    }
    // Outras dezenas
    else if (numero >= 20) {
        resultado += dezenas[Math.floor(numero / 10)];
        numero %= 10;
        if (numero > 0) resultado += ' e ';
    }

    // Unidades
    if (numero > 0 && numero < 10) {
        resultado += unidades[numero];
    }

    return resultado.trim();
}

// Função para validar campos obrigatórios
function validarCampos() {
    const camposObrigatorios = [
        'dia', 'mes', 'ano', 'delegacia', 'municipio', 
        'boIpTc', 'laudoPericial', 'prazoNumero', 'peritoCriminal'
    ];

    let todosValidos = true;

    camposObrigatorios.forEach(campo => {
        const elemento = document.getElementById(campo);
        const valor = elemento.value.trim();
        
        if (!valor) {
            elemento.classList.add('error');
            elemento.nextElementSibling.style.display = 'block';
            todosValidos = false;
        } else {
            elemento.classList.remove('error');
            elemento.nextElementSibling.style.display = 'none';
        }
    });

    return todosValidos;
}

// Função para coletar dados do formulário
function coletarDados() {
    const form = document.getElementById('oficioForm');
    const formData = new FormData(form);
    
    dadosOficio = {};
    for (let [key, value] of formData.entries()) {
        dadosOficio[key] = value.trim();
    }

    // Gerar prazo por extenso automaticamente
    if (dadosOficio.prazoNumero) {
        dadosOficio.prazoExtenso = numeroParaExtenso(parseInt(dadosOficio.prazoNumero));
        document.getElementById('prazoExtenso').value = dadosOficio.prazoExtenso;
    }

    return dadosOficio;
}

// Função para gerar o conteúdo do ofício
function gerarConteudoOficio(dados) {
    const dataRecebimento = dados.dataRecebimento ? 
        new Date(dados.dataRecebimento).toLocaleDateString('pt-BR') : 
        '___/___/____';

    return `
        <div class="preview-title">OFÍCIO</div>
        
        <div class="preview-date">
            Americana, ${dados.dia} de ${dados.mes} de ${dados.ano}.
        </div>
        
        <div class="preview-address">
            <strong>Ao Excelentíssimo Senhor Delegado de Polícia</strong><br>
            <strong>Delegacia de Polícia:</strong> ${dados.delegacia}<br>
            <strong>Município:</strong> ${dados.municipio}
        </div>
        
        <div class="preview-references">
            <strong>Referências:</strong><br><br>
            <strong>BO / IP / TC:</strong> ${dados.boIpTc}<br>
            <strong>Laudo Pericial:</strong> ${dados.laudoPericial}
        </div>
        
        <div class="preview-body">
            <strong>Exmo. Senhor(a) Delegado,</strong><br><br>
            
            Cumprimentando-o cordialmente, informo que este Perito Criminal foi designado para atender à requisição de exame pericial relacionada ao feito policial acima indicado.<br><br>
            
            Em virtude da elevada demanda de serviços periciais atualmente em execução nesta unidade e da limitação do quadro funcional disponível, não será possível concluir o laudo pericial dentro do prazo inicialmente fixado.<br><br>
            
            Desta forma, com fundamento no art. 160, Parágrafo Único, do Código de Processo Penal, solicito, respeitosamente, dilação de prazo para conclusão do Laudo Pericial de <strong>${dados.prazoNumero} (${dados.prazoExtenso})</strong> dias, a fim de assegurar a qualidade e a fidelidade técnica necessárias à conclusão do trabalho pericial.<br><br>
            
            Atenciosamente,
        </div>
        
        <div class="preview-signature">
            <strong>Perito Criminal:</strong> ${dados.peritoCriminal}<br><br>
            <strong>Assinatura:</strong> _________________________<br><br><br>
        </div>
        <div class="preview-date">
            <strong>Recebido em:</strong> __________________________<br><br>
            <strong>Nome/ cargo:</strong> _________________________<br><br>
            <strong>Data:</strong> ___/___/____
        </div>
    `;
}

// Função para gerar preview do ofício
function gerarPreview() {
    if (!validarCampos()) {
        alert('Por favor, preencha todos os campos obrigatórios antes de gerar a visualização.');
        return;
    }

    const dados = coletarDados();
    const conteudo = gerarConteudoOficio(dados);
    
    document.getElementById('previewContent').innerHTML = conteudo;
    document.getElementById('previewContainer').style.display = 'block';
    
    // Scroll suave para a preview
    document.getElementById('previewContainer').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Função para gerar PDF
function gerarPDF() {
    if (!validarCampos()) {
        alert('Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.');
        return;
    }

    const dados = coletarDados();
    
    // Criar nova instância do jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações de fonte e margens
    const margemEsquerda = 20;
    const margemDireita = 20;
    const larguraPagina = 210;
    const larguraTexto = larguraPagina - margemEsquerda - margemDireita;
    let posicaoY = 30;
    
    // Função auxiliar para adicionar texto com quebra de linha
    function adicionarTexto(texto, x, y, opcoes = {}) {
        const tamanhoFonte = opcoes.tamanho || 12;
        const estilo = opcoes.estilo || 'normal';
        const alinhamento = opcoes.alinhamento || 'left';
        
        doc.setFontSize(tamanhoFonte);
        doc.setFont('times', estilo);
        
        if (alinhamento === 'center') {
            doc.text(texto, larguraPagina / 2, y, { align: 'center' });
        } else if (alinhamento === 'right') {
            doc.text(texto, larguraPagina - margemDireita, y, { align: 'right' });
        } else {
            const linhas = doc.splitTextToSize(texto, larguraTexto);
            doc.text(linhas, x, y);
            return linhas.length * (tamanhoFonte * 0.35);
        }
        return tamanhoFonte * 0.35;
    }
    
    // Título
    posicaoY += adicionarTexto('OFÍCIO', 0, posicaoY, { 
        tamanho: 16, 
        estilo: 'bold', 
        alinhamento: 'center' 
    });
    posicaoY += 15;
    
    // Data
    const textoData = `Americana, ${dados.dia} de ${dados.mes} de ${dados.ano}.`;
    adicionarTexto(textoData, 0, posicaoY, { alinhamento: 'right' });
    posicaoY += 20;
    
    // Destinatário
    posicaoY += adicionarTexto('Ao Excelentíssimo Senhor Delegado de Polícia', margemEsquerda, posicaoY, { estilo: 'bold' });
    posicaoY += 5;
    posicaoY += adicionarTexto(`Delegacia de Polícia: ${dados.delegacia}`, margemEsquerda, posicaoY);
    posicaoY += 5;
    posicaoY += adicionarTexto(`Município: ${dados.municipio}`, margemEsquerda, posicaoY);
    posicaoY += 15;
    
    // Referências
    posicaoY += adicionarTexto('Referências:', margemEsquerda, posicaoY, { estilo: 'bold' });
    posicaoY += 10;
    posicaoY += adicionarTexto(`BO / IP / TC: ${dados.boIpTc}`, margemEsquerda, posicaoY);
    posicaoY += 5;
    posicaoY += adicionarTexto(`Laudo Pericial: ${dados.laudoPericial}`, margemEsquerda, posicaoY);
    posicaoY += 15;
    
    // Corpo do ofício
    posicaoY += adicionarTexto("Exmo. Senhor(a) Delegado,", margemEsquerda, posicaoY, { estilo: "bold" });
    posicaoY += 5;
    
    const paragrafo1 = "        Cumprimentando-o cordialmente, informo que este Perito Criminal foi designado para atender à requisição de exame pericial relacionada ao feito policial acima indicado.";
    posicaoY += adicionarTexto(paragrafo1, margemEsquerda, posicaoY);
    posicaoY += 5;
    
    const paragrafo2 = "        Em virtude da elevada demanda de serviços periciais atualmente em execução nesta unidade e da limitação do quadro funcional disponível, não será possível concluir o laudo pericial dentro do prazo inicialmente fixado.";
    posicaoY += adicionarTexto(paragrafo2, margemEsquerda, posicaoY);
    posicaoY += 5;
    
    const paragrafo3 = `        Desta forma, com fundamento no art. 160, Parágrafo Único, do Código de Processo Penal, solicito, respeitosamente, dilação de prazo para conclusão do Laudo Pericial de ${dados.prazoNumero} (${dados.prazoExtenso}) dias, a fim de assegurar a qualidade e a fidelidade técnica necessárias à conclusão do trabalho pericial.`;
    posicaoY += adicionarTexto(paragrafo3, margemEsquerda, posicaoY);
    posicaoY += 5;
    

    posicaoY += adicionarTexto("Atenciosamente,", margemEsquerda, posicaoY);
    posicaoY += 15;
    
    // Assinatura
    posicaoY += adicionarTexto(`Perito Criminal: ${dados.peritoCriminal}`, margemEsquerda, posicaoY);
    posicaoY += 5;
    posicaoY += adicionarTexto("Assinatura: _________________________", margemEsquerda, posicaoY);
    posicaoY += 10;
    
    // Recebimento
    posicaoY += adicionarTexto("Recebido em: __________________________", 0, posicaoY,{ alinhamento: 'right' });
    posicaoY += 5;

    posicaoY += adicionarTexto("Nome/ cargo: _________________________", 0, posicaoY,{ alinhamento: 'right' });
    posicaoY += 5;
    posicaoY += adicionarTexto("Data: ___/___/____.", 0, posicaoY,{ alinhamento: 'right' });
    
    // Salvar o PDF
    const nomeArquivo = `Oficio_Prazo_${dados.boIpTc.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(nomeArquivo);
    
    // Mostrar mensagem de sucesso
    //alert('PDF gerado com sucesso! O download deve iniciar automaticamente.');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Auto-preenchimento do prazo por extenso
    document.getElementById('prazoNumero').addEventListener('input', function() {
        const numero = parseInt(this.value);
        if (numero && numero > 0 && numero <= 365) {
            const extenso = numeroParaExtenso(numero);
            document.getElementById('prazoExtenso').value = extenso;
        } else {
            document.getElementById('prazoExtenso').value = '';
        }
    });
    
    // Remover erro ao digitar
    const campos = document.querySelectorAll('input, select');
    campos.forEach(campo => {
        campo.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
                this.nextElementSibling.style.display = 'none';
            }
        });
    });
    
    // Auto-preenchimento da data atual
    const hoje = new Date();
    document.getElementById('dia').value = hoje.getDate();
    document.getElementById('mes').value = hoje.toLocaleDateString('pt-BR', { month: 'long' });
    document.getElementById('ano').value = hoje.getFullYear();
});

// Função para limpar formulário
function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        document.getElementById('oficioForm').reset();
        document.getElementById('previewContainer').style.display = 'none';
        
        // Remover classes de erro
        const campos = document.querySelectorAll('.error');
        campos.forEach(campo => {
            campo.classList.remove('error');
        });
        
        const mensagensErro = document.querySelectorAll('.error-message');
        mensagensErro.forEach(mensagem => {
            mensagem.style.display = 'none';
        });
        
        // Repreenchimento da data atual
        const hoje = new Date();
        document.getElementById('dia').value = hoje.getDate();
        document.getElementById('mes').value = hoje.toLocaleDateString('pt-BR', { month: 'long' });
        document.getElementById('ano').value = hoje.getFullYear();
    }
}

