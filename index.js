// Definindo uma array para armazenar transações
let transactions = [];

// Função para criar um elemento de container para uma transação
function createContainerTransaction(id) {
    const containerTransaction = document.createElement('div');
    containerTransaction.classList.add('container-transaction');
    containerTransaction.id = `transaction-${id}`;
    return containerTransaction;
}

// Função para criar o título de uma transação
function createTransactionTitle(title) {
    const transactionTitle = document.createElement('span');
    transactionTitle.classList.add(`transaction-title`);
    transactionTitle.textContent = `${title}: `;
    return transactionTitle;
}

// Função para criar o valor de uma transação
function createTransactionAmount(amount) {
    const transactionAmount = document.createElement('span');
    const formatTransaction = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(amount);

    if (amount > 0) {
        transactionAmount.textContent = `${formatTransaction} C`;
        transactionAmount.classList.add('credit');
    } else {
        transactionAmount.textContent = `${formatTransaction} D`;
        transactionAmount.classList.add('debit');
    }

    return transactionAmount;
}

// Função para criar o botão "Editar" de uma transação
function createBtnEdit(id) {
    const btnEdit = document.createElement('button');
    btnEdit.id = id;
    btnEdit.textContent = 'Editar';
    btnEdit.classList.add('btnEdit');

    btnEdit.addEventListener('click', async () => {
        // Recupera a transação do servidor para edição
        const transactionedit = await fetch(`http://localhost:3000/transaction/${id}`).then(res => res.json());

        // Preenche os campos de edição com os dados da transação
        const idHtml = document.getElementById('id');
        const title = document.getElementById('title');
        const amount = document.getElementById('amount');
        
        idHtml.value = transactionedit.id;
        title.value = transactionedit.title;
        amount.value = transactionedit.amount;
    });

    return btnEdit;
}

// Função para criar o botão "Excluir" de uma transação
function createBtnDelete(id) {
    const btnDelete = document.createElement('button');
    btnDelete.id = id;
    btnDelete.textContent = 'Excluir';
    btnDelete.classList.add(`btnDelete`);
    btnDelete.dataset.delete = `btnDelete-${id}`;
    
    btnDelete.addEventListener('click', async () => {
        // Exclui a transação do servidor
        await fetch(`http://localhost:3000/transaction/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Remove a transação da array local
        const indexForRemove = transactions.findIndex(transaction => transaction.id === id);
        transactions.splice(indexForRemove, 1);
        
        // Remove o elemento da transação do DOM
        document.getElementById(`transaction-${id}`).remove();

        // Atualiza o saldo
        await updateBlance();
    });

    return btnDelete;
}

// Função para renderizar uma transação na tela
async function renderTransaction(transaction) {
    const article = document.getElementById('article');
    const container = createContainerTransaction(transaction.id);
    const title = createTransactionTitle(transaction.title);
    const amount = createTransactionAmount(transaction.amount);
    const btnEdit = createBtnEdit(transaction.id);
    const btnDelete = createBtnDelete(transaction.id);
    const containerBtn = document.createElement('div');
    containerBtn.append(btnEdit, btnDelete);
    containerBtn.classList.add('containerBtn');
    const containerValueTransaction = document.createElement('div');
    containerValueTransaction.classList.add('containerValueTransaction');
    containerValueTransaction.appendChild(amount);
    container.append(title, containerValueTransaction, containerBtn);
    article.appendChild(container);
}

// Função para salvar uma transação
async function saveTransaction(ev) {
    ev.preventDefault();

    const form = document.getElementById("form");
    const id = document.getElementById("id").value;
    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;

    if (id) {
        // Atualiza uma transação existente
        const newData = {
            title: title,
            amount: parseFloat(amount)
        };

        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        };

        const response = await fetch(`http://localhost:3000/transaction/${id}`, options).then((res) => res.json());

        // Remove a transação antiga da array local
        const indexForRemove = transactions.findIndex(transaction => transaction.id === parseInt(id));
        transactions.splice(indexForRemove, 1);

        // Remove o elemento da transação antiga do DOM
        document.getElementById(`transaction-${id}`).remove();

        // Adiciona a nova transação à array e ao DOM
        transactions.push(response);
        await renderTransaction(response);
        await updateBlance();

        form.reset();
    } else {
        // Cria uma nova transação
        const transactionData = {
            title: title,
            amount: parseFloat(amount),
        };

        const requestOptions = {
            method: "POST",
            headers: {
                "content-Type": "application/json",
            },
            body: JSON.stringify(transactionData),
        };

        // Envia os dados da nova transação ao servidor
        const transaction = await fetch("http://localhost:3000/transaction", requestOptions).then((res) => res.json());

        // Adiciona a nova transação à array e ao DOM
        transactions.push(transaction);
        await renderTransaction(transaction);
        await updateBlance();
        form.reset();
    }
}

// Adiciona um ouvinte de evento para o formulário de transação
document.getElementById('form').addEventListener('submit', saveTransaction);

// Função para buscar as transações do servidor
async function fetchTransactions() {
    return await fetch('http://localhost:3000/transaction').then(res => res.json());
}

// Função para atualizar o saldo
async function updateBlance() {
    const balanceSpan = document.getElementById('balance');
    const balance = transactions.reduce((sum, transaction) => sum += transaction.amount, 0);

    // Formata e exibe o saldo no elemento HTML
    balanceSpan.textContent = 'Saldo: ' + Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(balance);
}

// Função de inicialização
async function setup() {
    const result = await fetchTransactions();
    transactions.push(...result);
    transactions.forEach(renderTransaction);
    await updateBlance();
}

// Aguarda o carregamento completo do documento e, em seguida, executa a função de inicialização
document.addEventListener('DOMContentLoaded', setup);

// Adiciona um ouvinte de evento para o scroll da janela
window.addEventListener("scroll", function() {
    let divRolagem = document.querySelector(".balance");
    let scrollTop = window.scrollY;

    if (scrollTop >= 250) {
        divRolagem.classList.add("balance-fixed");
    } else {
        divRolagem.classList.remove("balance-fixed");
    }
});


let btnReturnTop = document.getElementById("btnReturnTop");
btnReturnTop.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});