/* =========================================================
   FIREBASE
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getDatabase,
    ref,
    push,
    set,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


/* =========================================================
   CONFIGURAÇÃO FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyCZ3xorH3D9Z0vmIfd_zafyceLJekXJPaY",

    authDomain:
        "amb-e-trans-caxiense-log.firebaseapp.com",

    databaseURL:
        "https://amb-e-trans-caxiense-log-default-rtdb.firebaseio.com",

    projectId:
        "amb-e-trans-caxiense-log",

    storageBucket:
        "amb-e-trans-caxiense-log.firebasestorage.app",

    messagingSenderId:
        "194048564958",

    appId:
        "1:194048564958:web:af334ffd5d248ec9d76c4f"
};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);


let usuario = null;

let todosRegistros = [];


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function hojeISO() {

    const agora = new Date();

    const ano = agora.getFullYear();

    const mes = String(
        agora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        agora.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function escaparHTML(texto) {

    if (texto === null || texto === undefined) {
        return "";
    }

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function mostrarMensagem(elemento, mensagem, tipo = "") {

    if (!elemento) {
        return;
    }

    elemento.textContent = mensagem;

    elemento.className = "mensagem";

    if (tipo) {
        elemento.classList.add(tipo);
    }
}


/* =========================================================
   DATA PADRÃO DOS FORMULÁRIOS
========================================================= */

function preencherDatas() {

    const hoje = hojeISO();

    const campos = [
        "dataAmbulancia",
        "dataTransferencia",
        "dataApoio"
    ];

    campos.forEach(id => {

        const campo = document.getElementById(id);

        if (campo && !campo.value) {
            campo.value = hoje;
        }

    });

    const dataDashboard =
        document.getElementById("dataDashboard");

    if (dataDashboard) {

        const data = new Date();

        dataDashboard.textContent =
            data.toLocaleDateString(
                "pt-BR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );
    }
}


/* =========================================================
   LOGIN
========================================================= */

const formLogin =
    document.getElementById("formLogin");


if (formLogin) {

    formLogin.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("loginEmail")
                    .value
                    .trim();

            const senha =
                document.getElementById("loginSenha")
                    .value;

            const mensagem =
                document.getElementById("mensagemLogin");


            mostrarMensagem(
                mensagem,
                "Entrando..."
            );


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );

                mostrarMensagem(
                    mensagem,
                    "Login realizado com sucesso!",
                    "sucesso"
                );

            } catch (erro) {

                console.error(erro);

                let texto =
                    "Não foi possível realizar o login.";

                if (
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    texto =
                        "E-mail ou senha incorretos.";

                } else if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    texto =
                        "Usuário não encontrado.";

                } else if (
                    erro.code ===
                    "auth/wrong-password"
                ) {

                    texto =
                        "Senha incorreta.";

                } else if (
                    erro.code ===
                    "auth/invalid-email"
                ) {

                    texto =
                        "E-mail inválido.";
                }

                mostrarMensagem(
                    mensagem,
                    texto,
                    "erro"
                );
            }

        }
    );
}


/* =========================================================
   ESTADO DE AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
    auth,
    function (user) {

        usuario = user;

        const telaLogin =
            document.getElementById("telaLogin");

        const sistema =
            document.getElementById("sistema");

        const nomeUsuario =
            document.getElementById("nomeUsuario");

        const usuarioTopbar =
            document.getElementById("usuarioTopbar");


        if (user) {

            if (telaLogin) {
                telaLogin.style.display = "none";
            }

            if (sistema) {
                sistema.style.display = "block";
            }

            if (nomeUsuario) {
                nomeUsuario.textContent =
                    user.email;
            }

            if (usuarioTopbar) {
                usuarioTopbar.textContent =
                    user.email;
            }

            preencherDatas();

            carregarDashboard();

            carregarRegistros();

        } else {

            if (telaLogin) {
                telaLogin.style.display = "flex";
            }

            if (sistema) {
                sistema.style.display = "none";
            }
        }

    }
);


/* =========================================================
   SAIR
========================================================= */

window.sairSistema = async function () {

    try {

        await signOut(auth);

    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

    }
};


/* =========================================================
   MENU MOBILE
========================================================= */

window.alternarSidebar = function () {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("aberta");
};


/* Fecha sidebar ao clicar em uma página no celular */

function fecharSidebarMobile() {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    if (window.innerWidth <= 900) {

        sidebar.classList.remove("aberta");

    }
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

window.mostrarPagina = function (pagina) {

    const paginas = document.querySelectorAll(".pagina");

    paginas.forEach(item => {
        item.classList.remove("ativa");
    });


    const botoes =
        document.querySelectorAll(".menu-item");

    botoes.forEach(item => {
        item.classList.remove("ativo");
    });


    let elementoPagina = null;

    let elementoMenu = null;

    let titulo = "Dashboard";


    if (pagina === "dashboard") {

        elementoPagina =
            document.getElementById(
                "paginaDashboard"
            );

        elementoMenu =
            document.getElementById(
                "menuDashboard"
            );

        titulo = "Dashboard";

    } else if (pagina === "ambulancia") {

        elementoPagina =
            document.getElementById(
                "paginaAmbulancia"
            );

        elementoMenu =
            document.getElementById(
                "menuAmbulancia"
            );

        titulo = "Lançar Ambulância";

    } else if (pagina === "transferencia") {

        elementoPagina =
            document.getElementById(
                "paginaTransferencia"
            );

        elementoMenu =
            document.getElementById(
                "menuTransferencia"
            );

        titulo = "Lançar Transferência";

    } else if (pagina === "apoio") {

        elementoPagina =
            document.getElementById(
                "paginaApoio"
            );

        elementoMenu =
            document.getElementById(
                "menuApoio"
            );

        titulo = "Apoio de Rota";

    } else if (pagina === "registros") {

        elementoPagina =
            document.getElementById(
                "paginaRegistros"
            );

        elementoMenu =
            document.getElementById(
                "menuRegistros"
            );

        titulo = "Registros";
    }


    if (elementoPagina) {
        elementoPagina.classList.add("ativa");
    }

    if (elementoMenu) {
        elementoMenu.classList.add("ativo");
    }


    const tituloPagina =
        document.getElementById(
            "tituloPagina"
        );

    if (tituloPagina) {
        tituloPagina.textContent =
            titulo;
    }


    fecharSidebarMobile();

};


/* =========================================================
   SALVAR AMBULÂNCIA
========================================================= */

const formAmbulancia =
    document.getElementById(
        "formAmbulancia"
    );


if (formAmbulancia) {

    formAmbulancia.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (!usuario) {

                alert(
                    "Você precisa estar logado."
                );

                return;
            }


            const registro = {

                tipo: "ambulancia",

                data:
                    document.getElementById(
                        "dataAmbulancia"
                    ).value,

                rota:
                    document.getElementById(
                        "rotaAmbulancia"
                    ).value.trim(),

                driver:
                    document.getElementById(
                        "driverAmbulancia"
                    ).value.trim(),

                cidade:
                    document.getElementById(
                        "cidadeAmbulancia"
                    ).value.trim(),

                pacotes:
                    Number(
                        document.getElementById(
                            "pacotesAmbulancia"
                        ).value || 0
                    ),

                motivo:
                    document.getElementById(
                        "motivoAmbulancia"
                    ).value.trim(),

                meliLiberou:
                    document.getElementById(
                        "meliAmbulancia"
                    ).value.trim(),

                observacoes:
                    document.getElementById(
                        "obsAmbulancia"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            db,
                            "ambulancias"
                        )
                    );


                await set(
                    novaReferencia,
                    registro
                );


                alert(
                    "Ambulância lançada com sucesso!"
                );


                formAmbulancia.reset();

                preencherDatas();

                carregarDashboard();

                carregarRegistros();


            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao lançar ambulância."
                );

            }

        }
    );
}


/* =========================================================
   SALVAR TRANSFERÊNCIA
========================================================= */

const formTransferencia =
    document.getElementById(
        "formTransferencia"
    );


if (formTransferencia) {

    formTransferencia.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuario) {

                alert(
                    "Você precisa estar logado."
                );

                return;
            }


            const registro = {

                tipo: "transferencia",

                data:
                    document.getElementById(
                        "dataTransferencia"
                    ).value,

                rota:
                    document.getElementById(
                        "rotaTransferencia"
                    ).value.trim(),

                driverInicial:
                    document.getElementById(
                        "driverInicial"
                    ).value.trim(),

                driverSubstituto:
                    document.getElementById(
                        "driverSubstituto"
                    ).value.trim(),

                driver:
                    document.getElementById(
                        "driverSubstituto"
                    ).value.trim(),

                cidade:
                    document.getElementById(
                        "cidadeTransferencia"
                    ).value.trim(),

                motivo:
                    document.getElementById(
                        "motivoTransferencia"
                    ).value.trim(),

                meliLiberou:
                    document.getElementById(
                        "meliTransferencia"
                    ).value.trim(),

                observacoes:
                    document.getElementById(
                        "obsTransferencia"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            db,
                            "transferencias"
                        )
                    );


                await set(
                    novaReferencia,
                    registro
                );


                alert(
                    "Transferência lançada com sucesso!"
                );


                formTransferencia.reset();

                preencherDatas();

                carregarDashboard();

                carregarRegistros();


            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao lançar transferência."
                );

            }

        }
    );
}


/* =========================================================
   SALVAR APOIO
========================================================= */

const formApoio =
    document.getElementById(
        "formApoio"
    );


if (formApoio) {

    formApoio.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuario) {

                alert(
                    "Você precisa estar logado."
                );

                return;
            }


            const registro = {

                tipo: "apoio",

                data:
                    document.getElementById(
                        "dataApoio"
                    ).value,

                rota:
                    document.getElementById(
                        "rotaApoio"
                    ).value.trim(),

                valor:
                    Number(
                        document.getElementById(
                            "valorApoio"
                        ).value || 0
                    ),

                driverRealizaApoio:
                    document.getElementById(
                        "driverRealizaApoio"
                    ).value.trim(),

                driverPrecisaApoio:
                    document.getElementById(
                        "driverPrecisaApoio"
                    ).value.trim(),

                driver:
                    document.getElementById(
                        "driverRealizaApoio"
                    ).value.trim(),

                quemLiberou:
                    document.getElementById(
                        "quemLiberouApoio"
                    ).value.trim(),

                observacoes:
                    document.getElementById(
                        "obsApoio"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            db,
                            "apoios"
                        )
                    );


                await set(
                    novaReferencia,
                    registro
                );


                alert(
                    "Apoio lançado com sucesso!"
                );


                formApoio.reset();

                preencherDatas();

                carregarDashboard();

                carregarRegistros();


            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao lançar apoio."
                );

            }

        }
    );
}


/* =========================================================
   CARREGAR DASHBOARD
========================================================= */

function carregarDashboard() {

    let ambulancias = [];

    let transferencias = [];

    let apoios = [];


    onValue(
        ref(db, "ambulancias"),
        snapshot => {

            ambulancias = [];

            snapshot.forEach(item => {

                ambulancias.push({

                    id: item.key,

                    ...item.val(),

                    tipo: "ambulancia"

                });

            });

            atualizarDashboard(
                ambulancias,
                transferencias,
                apoios
            );

        },
        {
            onlyOnce: true
        }
    );


    onValue(
        ref(db, "transferencias"),
        snapshot => {

            transferencias = [];

            snapshot.forEach(item => {

                transferencias.push({

                    id: item.key,

                    ...item.val(),

                    tipo: "transferencia"

                });

            });

            atualizarDashboard(
                ambulancias,
                transferencias,
                apoios
            );

        },
        {
            onlyOnce: true
        }
    );


    onValue(
        ref(db, "apoios"),
        snapshot => {

            apoios = [];

            snapshot.forEach(item => {

                apoios.push({

                    id: item.key,

                    ...item.val(),

                    tipo: "apoio"

                });

            });

            atualizarDashboard(
                ambulancias,
                transferencias,
                apoios
            );

        },
        {
            onlyOnce: true
        }
    );
}


function atualizarDashboard(
    ambulancias,
    transferencias,
    apoios
) {

    const totalA =
        ambulancias.length;

    const totalT =
        transferencias.length;

    const totalP =
        apoios.length;

    const total =
        totalA +
        totalT +
        totalP;


    const elementoA =
        document.getElementById(
            "totalAmbulancias"
        );

    const elementoT =
        document.getElementById(
            "totalTransferencias"
        );

    const elementoP =
        document.getElementById(
            "totalApoios"
        );

    const elementoGeral =
        document.getElementById(
            "totalGeral"
        );


    if (elementoA) {
        elementoA.textContent = totalA;
    }

    if (elementoT) {
        elementoT.textContent = totalT;
    }

    if (elementoP) {
        elementoP.textContent = totalP;
    }

    if (elementoGeral) {
        elementoGeral.textContent = total;
    }


    const valorTotal =
        apoios.reduce(
            (soma, item) =>
                soma + Number(item.valor || 0),
            0
        );


    const valorElemento =
        document.getElementById(
            "valorTotalApoios"
        );

    if (valorElemento) {

        valorElemento.textContent =
            formatarMoeda(valorTotal);
    }


    /* =========================
       HOJE
    ========================== */

    const hoje = hojeISO();


    const hojeA =
        ambulancias.filter(
            item => item.data === hoje
        ).length;


    const hojeT =
        transferencias.filter(
            item => item.data === hoje
        ).length;


    const apoiosHoje =
        apoios.filter(
            item => item.data === hoje
        );


    const hojeP =
        apoiosHoje.length;


    const valorHoje =
        apoiosHoje.reduce(
            (soma, item) =>
                soma + Number(item.valor || 0),
            0
        );


    const hA =
        document.getElementById(
            "hojeAmbulancias"
        );

    const hT =
        document.getElementById(
            "hojeTransferencias"
        );

    const hP =
        document.getElementById(
            "hojeApoios"
        );

    const hValor =
        document.getElementById(
            "hojeValorApoios"
        );


    if (hA) {
        hA.textContent = hojeA;
    }

    if (hT) {
        hT.textContent = hojeT;
    }

    if (hP) {
        hP.textContent = hojeP;
    }

    if (hValor) {
        hValor.textContent =
            formatarMoeda(valorHoje);
    }


    /* =========================
       BARRAS
    ========================== */

    const barraA =
        document.getElementById(
            "barraAmbulancias"
        );

    const barraT =
        document.getElementById(
            "barraTransferencias"
        );

    const barraP =
        document.getElementById(
            "barraApoios"
        );


    const textoA =
        document.getElementById(
            "barraAmbulanciasTexto"
        );

    const textoT =
        document.getElementById(
            "barraTransferenciasTexto"
        );

    const textoP =
        document.getElementById(
            "barraApoiosTexto"
        );


    if (textoA) {
        textoA.textContent = totalA;
    }

    if (textoT) {
        textoT.textContent = totalT;
    }

    if (textoP) {
        textoP.textContent = totalP;
    }


    if (total > 0) {

        if (barraA) {
            barraA.style.width =
                `${(totalA / total) * 100}%`;
        }

        if (barraT) {
            barraT.style.width =
                `${(totalT / total) * 100}%`;
        }

        if (barraP) {
            barraP.style.width =
                `${(totalP / total) * 100}%`;
        }

    } else {

        if (barraA) {
            barraA.style.width = "0%";
        }

        if (barraT) {
            barraT.style.width = "0%";
        }

        if (barraP) {
            barraP.style.width = "0%";
        }
    }


    /* =========================
       ÚLTIMOS LANÇAMENTOS
    ========================== */

    const todos = [
        ...ambulancias,
        ...transferencias,
        ...apoios
    ];


    todos.sort(
        (a, b) =>
            Number(b.criadoEm || 0) -
            Number(a.criadoEm || 0)
    );


    const ultimos =
        todos.slice(0, 5);


    const container =
        document.getElementById(
            "ultimosLancamentos"
        );


    if (!container) {
        return;
    }


    if (ultimos.length === 0) {

        container.innerHTML = `
            <div class="estado-vazio">
                Nenhum registro encontrado.
            </div>
        `;

        return;
    }


    container.innerHTML =
        ultimos.map(
            registro =>
                criarMiniRegistro(
                    registro
                )
        ).join("");
}


function criarMiniRegistro(registro) {

    let tipoTexto = "";

    let classe = "";

    let icone = "";


    if (registro.tipo === "ambulancia") {

        tipoTexto = "Ambulância";

        classe =
            "tipo-ambulancia";

        icone = "🚑";

    } else if (
        registro.tipo === "transferencia"
    ) {

        tipoTexto = "Transferência";

        classe =
            "tipo-transferencia";

        icone = "🔄";

    } else {

        tipoTexto = "Apoio";

        classe =
            "tipo-apoio";

        icone = "🤝";
    }


    return `

        <div class="registro-card">

            <div class="registro-cabecalho">

                <span class="registro-tipo ${classe}">
                    ${icone}
                    ${tipoTexto}
                </span>

                <span class="registro-data">
                    ${formatarData(registro.data)}
                </span>

            </div>

            <div class="registro-grid">

                <div class="registro-info">

                    <span>Rota</span>

                    <strong>
                        ${escaparHTML(registro.rota || "-")}
                    </strong>

                </div>


                <div class="registro-info">

                    <span>Cidade</span>

                    <strong>
                        ${escaparHTML(registro.cidade || "-")}
                    </strong>

                </div>


                <div class="registro-info">

                    <span>Driver</span>

                    <strong>
                        ${escaparHTML(
                            registro.driver ||
                            registro.driverRealizaApoio ||
                            registro.driverSubstituto ||
                            "-"
                        )}
                    </strong>

                </div>


                <div class="registro-info">

                    <span>Valor</span>

                    <strong>
                        ${
                            registro.tipo === "apoio"
                                ? formatarMoeda(registro.valor)
                                : "-"
                        }
                    </strong>

                </div>

            </div>

        </div>

    `;
}


/* =========================================================
   CARREGAR REGISTROS
========================================================= */

function carregarRegistros() {

    let ambulancias = [];

    let transferencias = [];

    let apoios = [];


    function atualizarLista() {

        todosRegistros = [

            ...ambulancias.map(item => ({
                ...item,
                tipo: "ambulancia"
            })),

            ...transferencias.map(item => ({
                ...item,
                tipo: "transferencia"
            })),

            ...apoios.map(item => ({
                ...item,
                tipo: "apoio"
            }))

        ];


        todosRegistros.sort(
            (a, b) =>
                Number(b.criadoEm || 0) -
                Number(a.criadoEm || 0)
        );


        aplicarFiltros();
    }


    onValue(
        ref(db, "ambulancias"),
        snapshot => {

            ambulancias = [];

            snapshot.forEach(item => {

                ambulancias.push({

                    id: item.key,

                    ...item.val()

                });

            });

            atualizarLista();

        },
        {
            onlyOnce: true
        }
    );


    onValue(
        ref(db, "transferencias"),
        snapshot => {

            transferencias = [];

            snapshot.forEach(item => {

                transferencias.push({

                    id: item.key,

                    ...item.val()

                });

            });

            atualizarLista();

        },
        {
            onlyOnce: true
        }
    );


    onValue(
        ref(db, "apoios"),
        snapshot => {

            apoios = [];

            snapshot.forEach(item => {

                apoios.push({

                    id: item.key,

                    ...item.val()

                });

            });

            atualizarLista();

        },
        {
            onlyOnce: true
        }
    );
}


/* =========================================================
   FILTROS
========================================================= */

function aplicarFiltros() {

    const filtroData =
        document.getElementById(
            "filtroData"
        )?.value || "";


    const filtroRota =
        document.getElementById(
            "filtroRota"
        )?.value
            .toLowerCase()
            .trim() || "";


    const filtroDriver =
        document.getElementById(
            "filtroDriver"
        )?.value
            .toLowerCase()
            .trim() || "";


    const filtroTipo =
        document.getElementById(
            "filtroTipo"
        )?.value || "";


    const filtrados =
        todosRegistros.filter(
            registro => {

                const rota =
                    String(
                        registro.rota || ""
                    ).toLowerCase();


                const driver =
                    String(
                        registro.driver ||
                        registro.driverRealizaApoio ||
                        registro.driverSubstituto ||
                        registro.driverInicial ||
                        ""
                    ).toLowerCase();


                const atendeData =
                    !filtroData ||
                    registro.data === filtroData;


                const atendeRota =
                    !filtroRota ||
                    rota.includes(filtroRota);


                const atendeDriver =
                    !filtroDriver ||
                    driver.includes(filtroDriver);


                const atendeTipo =
                    !filtroTipo ||
                    registro.tipo === filtroTipo;


                return (
                    atendeData &&
                    atendeRota &&
                    atendeDriver &&
                    atendeTipo
                );
            }
        );


    renderizarRegistros(filtrados);
}


window.limparFiltros = function () {

    const filtroData =
        document.getElementById(
            "filtroData"
        );

    const filtroRota =
        document.getElementById(
            "filtroRota"
        );

    const filtroDriver =
        document.getElementById(
            "filtroDriver"
        );

    const filtroTipo =
        document.getElementById(
            "filtroTipo"
        );


    if (filtroData) {
        filtroData.value = "";
    }

    if (filtroRota) {
        filtroRota.value = "";
    }

    if (filtroDriver) {
        filtroDriver.value = "";
    }

    if (filtroTipo) {
        filtroTipo.value = "";
    }


    aplicarFiltros();
};


[
    "filtroData",
    "filtroRota",
    "filtroDriver",
    "filtroTipo"
].forEach(id => {

    const elemento =
        document.getElementById(id);

    if (!elemento) {
        return;
    }

    elemento.addEventListener(
        "input",
        aplicarFiltros
    );

    elemento.addEventListener(
        "change",
        aplicarFiltros
    );

});


/* =========================================================
   RENDERIZAR REGISTROS
========================================================= */

function renderizarRegistros(registros) {

    const container =
        document.getElementById(
            "listaRegistros"
        );


    if (!container) {
        return;
    }


    if (registros.length === 0) {

        container.innerHTML = `

            <div class="estado-vazio">

                Nenhum registro encontrado
                com os filtros selecionados.

            </div>

        `;

        return;
    }


    container.innerHTML =
        registros.map(
            registro =>
                criarRegistroHTML(
                    registro
                )
        ).join("");
}


function criarRegistroHTML(registro) {

    let tipoTexto = "";

    let classe = "";

    let icone = "";


    if (registro.tipo === "ambulancia") {

        tipoTexto = "Ambulância";

        classe =
            "tipo-ambulancia";

        icone = "🚑";

    } else if (
        registro.tipo === "transferencia"
    ) {

        tipoTexto = "Transferência";

        classe =
            "tipo-transferencia";

        icone = "🔄";

    } else {

        tipoTexto = "Apoio";

        classe =
            "tipo-apoio";

        icone = "🤝";
    }


    let detalhes = "";


    if (registro.tipo === "ambulancia") {

        detalhes = `

            <div class="registro-info">

                <span>Pacotes</span>

                <strong>
                    ${escaparHTML(
                        registro.pacotes ?? "-"
                    )}
                </strong>

            </div>


            <div class="registro-info">

                <span>Quem liberou Meli</span>

                <strong>
                    ${escaparHTML(
                        registro.meliLiberou || "-"
                    )}
                </strong>

            </div>


            <div class="registro-info">

                <span>Motivo</span>

                <strong>
                    ${escaparHTML(
                        registro.motivo || "-"
                    )}
                </strong>

            </div>

        `;

    } else if (
        registro.tipo === "transferencia"
    ) {

        detalhes = `

            <div class="registro-info">

                <span>Driver inicial</span>

                <strong>
                    ${escaparHTML(
                        registro.driverInicial || "-"
                    )}
                </strong>

            </div>


            <div class="registro-info">

                <span>Substituto</span>

                <strong>
                    ${escaparHTML(
                        registro.driverSubstituto || "-"
                    )}
                </strong>

            </div>


            <div class="registro-info">

                <span>Quem liberou Meli</span>

                <strong>
                    ${escaparHTML(
                        registro.meliLiberou || "-"
                    )}
                </strong>

            </div>

        `;

    } else {

        detalhes = `

            <div class="registro-info">

                <span>Valor</span>

                <strong>
                    ${formatarMoeda(
                        registro.valor
                    )}
                </strong>

            </div>


            <div class="registro-info">

                <span>Driver que realiza</span>

                <strong>
                    ${escaparHTML(
                        registro.driverRealizaApoio || "-"
                    )}
                </strong>

            </div>


            <div class="registro-info">

                <span>Driver que precisa</span>

                <strong>
                    ${escaparHTML(
                        registro.driverPrecisaApoio || "-"
                    )}
                </strong>

            </div>


            <div class="registro-info">

                <span>Quem liberou</span>

                <strong>
                    ${escaparHTML(
                        registro.quemLiberou || "-"
                    )}
                </strong>

            </div>

        `;
    }


    return `

        <div class="registro-card">

            <div class="registro-cabecalho">

                <span class="registro-tipo ${classe}">
                    ${icone}
                    ${tipoTexto}
                </span>

                <span class="registro-data">
                    ${formatarData(
                        registro.data
                    )}
                </span>

            </div>


            <div class="registro-grid">

                <div class="registro-info">

                    <span>Rota</span>

                    <strong>
                        ${escaparHTML(
                            registro.rota || "-"
                        )}
                    </strong>

                </div>


                <div class="registro-info">

                    <span>Cidade</span>

                    <strong>
                        ${escaparHTML(
                            registro.cidade || "-"
                        )}
                    </strong>

                </div>


                ${detalhes}

            </div>


            ${
                registro.observacoes
                    ? `
                        <div class="registro-observacao">

                            <strong>
                                Observações:
                            </strong>

                            ${escaparHTML(
                                registro.observacoes
                            )}

                        </div>
                    `
                    : ""
            }


            <div class="registro-rodape">

                <span class="registro-lancado">

                    Lançado por:
                    ${escaparHTML(
                        registro.lancadoPor || "-"
                    )}

                </span>


                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirRegistro(
                        '${registro.tipo}',
                        '${registro.id}'
                    )"
                >
                    🗑 Excluir
                </button>

            </div>

        </div>

    `;
}


/* =========================================================
   EXCLUIR REGISTRO
========================================================= */

window.excluirRegistro =
    async function (
        tipo,
        id
    ) {

        if (!usuario) {

            alert(
                "Você precisa estar logado."
            );

            return;
        }


        const confirmar =
            confirm(
                "Tem certeza que deseja excluir este registro?"
            );


        if (!confirmar) {
            return;
        }


        let caminho = "";


        if (tipo === "ambulancia") {

            caminho = "ambulancias";

        } else if (
            tipo === "transferencia"
        ) {

            caminho = "transferencias";

        } else if (
            tipo === "apoio"
        ) {

            caminho = "apoios";

        } else {

            return;
        }


        try {

            await remove(
                ref(
                    db,
                    `${caminho}/${id}`
                )
            );


            alert(
                "Registro excluído com sucesso!"
            );


            carregarDashboard();

            carregarRegistros();


        } catch (erro) {

            console.error(erro);

            alert(
                "Não foi possível excluir o registro."
            );

        }

    };


/* =========================================================
   ALTERAR SENHA
========================================================= */

window.abrirAlterarSenha =
    function () {

        const modal =
            document.getElementById(
                "modalSenha"
            );

        if (modal) {
            modal.classList.add("aberto");
        }
    };


window.fecharAlterarSenha =
    function () {

        const modal =
            document.getElementById(
                "modalSenha"
            );

        if (modal) {
            modal.classList.remove("aberto");
        }

        const form =
            document.getElementById(
                "formAlterarSenha"
            );

        if (form) {
            form.reset();
        }

        const mensagem =
            document.getElementById(
                "mensagemSenha"
            );

        if (mensagem) {
            mensagem.textContent = "";
        }
    };


const formAlterarSenha =
    document.getElementById(
        "formAlterarSenha"
    );


if (formAlterarSenha) {

    formAlterarSenha.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuario) {

                return;
            }


            const senhaAtual =
                document.getElementById(
                    "senhaAtual"
                ).value;


            const novaSenha =
                document.getElementById(
                    "novaSenha"
                ).value;


            const confirmarSenha =
                document.getElementById(
                    "confirmarSenha"
                ).value;


            const mensagem =
                document.getElementById(
                    "mensagemSenha"
                );


            if (novaSenha !== confirmarSenha) {

                mostrarMensagem(
                    mensagem,
                    "As novas senhas não são iguais.",
                    "erro"
                );

                return;
            }


            if (novaSenha.length < 6) {

                mostrarMensagem(
                    mensagem,
                    "A nova senha precisa ter pelo menos 6 caracteres.",
                    "erro"
                );

                return;
            }


            try {

                mostrarMensagem(
                    mensagem,
                    "Alterando senha..."
                );


                const credencial =
                    EmailAuthProvider.credential(
                        usuario.email,
                        senhaAtual
                    );


                await reauthenticateWithCredential(
                    usuario,
                    credencial
                );


                await updatePassword(
                    usuario,
                    novaSenha
                );


                mostrarMensagem(
                    mensagem,
                    "Senha alterada com sucesso!",
                    "sucesso"
                );


                setTimeout(
                    () => {

                        fecharAlterarSenha();

                    },
                    1500
                );


            } catch (erro) {

                console.error(erro);


                let texto =
                    "Não foi possível alterar a senha.";


                if (
                    erro.code ===
                    "auth/wrong-password"
                ) {

                    texto =
                        "A senha atual está incorreta.";

                } else if (
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    texto =
                        "A senha atual está incorreta.";

                } else if (
                    erro.code ===
                    "auth/weak-password"
                ) {

                    texto =
                        "A nova senha é muito fraca.";

                } else if (
                    erro.code ===
                    "auth/requires-recent-login"
                ) {

                    texto =
                        "Por segurança, saia e entre novamente antes de alterar a senha.";
                }


                mostrarMensagem(
                    mensagem,
                    texto,
                    "erro"
                );
            }

        }
    );
}


/* =========================================================
   RECUPERAR SENHA
========================================================= */

window.abrirRecuperarSenha =
    function () {

        const modal =
            document.getElementById(
                "modalRecuperarSenha"
            );

        if (modal) {

            modal.classList.add(
                "aberto"
            );

            const emailLogin =
                document.getElementById(
                    "loginEmail"
                );

            const emailRecuperacao =
                document.getElementById(
                    "emailRecuperacao"
                );


            if (
                emailLogin &&
                emailRecuperacao &&
                emailLogin.value
            ) {

                emailRecuperacao.value =
                    emailLogin.value;
            }
        }
    };


window.fecharRecuperarSenha =
    function () {

        const modal =
            document.getElementById(
                "modalRecuperarSenha"
            );

        if (modal) {
            modal.classList.remove(
                "aberto"
            );
        }


        const mensagem =
            document.getElementById(
                "mensagemRecuperacao"
            );

        if (mensagem) {
            mensagem.textContent = "";
        }
    };


const formRecuperarSenha =
    document.getElementById(
        "formRecuperarSenha"
    );


if (formRecuperarSenha) {

    formRecuperarSenha.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "emailRecuperacao"
                ).value.trim();


            const mensagem =
                document.getElementById(
                    "mensagemRecuperacao"
                );


            try {

                mostrarMensagem(
                    mensagem,
                    "Enviando e-mail..."
                );


                await sendPasswordResetEmail(
                    auth,
                    email
                );


                mostrarMensagem(
                    mensagem,
                    "E-mail de recuperação enviado! Verifique também a caixa de spam.",
                    "sucesso"
                );


            } catch (erro) {

                console.error(erro);


                let texto =
                    "Não foi possível enviar o e-mail.";


                if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    texto =
                        "Não encontramos um usuário com esse e-mail.";

                } else if (
                    erro.code ===
                    "auth/invalid-email"
                ) {

                    texto =
                        "Digite um e-mail válido.";
                }


                mostrarMensagem(
                    mensagem,
                    texto,
                    "erro"
                );
            }

        }
    );
}


/* =========================================================
   FECHAR MODAIS CLICANDO FORA
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const modalSenha =
            document.getElementById(
                "modalSenha"
            );


        const modalRecuperacao =
            document.getElementById(
                "modalRecuperarSenha"
            );


        if (
            event.target === modalSenha
        ) {

            fecharAlterarSenha();

        }


        if (
            event.target ===
            modalRecuperacao
        ) {

            fecharRecuperarSenha();

        }

    }
);


/* =========================================================
   FECHAR SIDEBAR AO CLICAR FORA NO CELULAR
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (window.innerWidth > 900) {
            return;
        }


        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        const botao =
            document.getElementById(
                "btnMenuMobile"
            );


        if (!sidebar || !botao) {
            return;
        }


        if (
            sidebar.classList.contains(
                "aberta"
            ) &&
            !sidebar.contains(event.target) &&
            !botao.contains(event.target)
        ) {

            sidebar.classList.remove(
                "aberta"
            );
        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        preencherDatas();

        console.log(
            "Caxiense LOG - Sistema carregado."
        );

    }
);