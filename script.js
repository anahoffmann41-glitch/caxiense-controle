// ======================================================
// CAXIENSE CONTROLE
// SCRIPT PRINCIPAL
// ======================================================

// ======================================================
// FIREBASE
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

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


// ======================================================
// CONFIGURAÇÃO FIREBASE
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyCZ3xorH3D9Z0vmIfd_zafyceLJekXJPaY",
    authDomain: "amb-e-trans-caxiense-log.firebaseapp.com",
    databaseURL: "https://amb-e-trans-caxiense-log-default-rtdb.firebaseio.com",
    projectId: "amb-e-trans-caxiense-log",
    storageBucket: "amb-e-trans-caxiense-log.firebasestorage.app",
    messagingSenderId: "194048564958",
    appId: "1:194048564958:web:af334ffd5d248ec9d76c4f"
};


// ======================================================
// INICIALIZAÇÃO
// ======================================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);

let usuario = null;

let todosRegistros = [];


// ======================================================
// MENU MOBILE
// CORREÇÃO PARA CELULAR
// ======================================================

window.alternarSidebar = function () {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;

    sidebar.classList.toggle("aberta");

};


// ======================================================
// FECHAR SIDEBAR NO CELULAR
// ======================================================

function fecharSidebarMobile() {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) return;

    sidebar.classList.remove("aberta");

}


// ======================================================
// LOGIN
// ======================================================

const formLogin = document.getElementById("formLogin");

if (formLogin) {

    formLogin.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const senha =
            document.getElementById("loginSenha").value;

        const mensagem =
            document.getElementById("mensagemLogin");


        mensagem.className = "mensagem";

        mensagem.textContent = "";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );

        } catch (erro) {

            console.error(erro);

            mensagem.className = "mensagem erro";

            if (
                erro.code === "auth/invalid-credential" ||
                erro.code === "auth/wrong-password" ||
                erro.code === "auth/user-not-found"
            ) {

                mensagem.textContent =
                    "E-mail ou senha incorretos.";

            } else {

                mensagem.textContent =
                    "Não foi possível entrar. Verifique seus dados.";

            }

        }

    });

}


// ======================================================
// VERIFICAR LOGIN
// ======================================================

onAuthStateChanged(auth, function (user) {

    usuario = user;

    const telaLogin =
        document.getElementById("telaLogin");

    const sistema =
        document.getElementById("sistema");

    const nomeUsuario =
        document.getElementById("nomeUsuario");


    if (user) {

        if (telaLogin) {
            telaLogin.classList.add("escondida");
        }

        if (sistema) {
            sistema.classList.remove("escondida");
        }

        if (nomeUsuario) {

            nomeUsuario.textContent =
                user.email || "Usuário";

        }


        definirDatas();

        carregarDashboard();

        carregarRegistros();

    } else {

        if (telaLogin) {
            telaLogin.classList.remove("escondida");
        }

        if (sistema) {
            sistema.classList.add("escondida");
        }

    }

});


// ======================================================
// SAIR
// ======================================================

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


// ======================================================
// MOSTRAR PÁGINA
// ======================================================

window.mostrarPagina = function (pagina) {

    const paginas = {

        dashboard:
            document.getElementById("paginaDashboard"),

        ambulancia:
            document.getElementById("paginaAmbulancia"),

        transferencia:
            document.getElementById("paginaTransferencia"),

        apoio:
            document.getElementById("paginaApoio"),

        registros:
            document.getElementById("paginaRegistros")

    };


    // Esconde todas

    Object.values(paginas).forEach(function (elemento) {

        if (elemento) {

            elemento.classList.add("escondida");

        }

    });


    // Mostra selecionada

    if (paginas[pagina]) {

        paginas[pagina].classList.remove("escondida");

    }


    // Menu ativo

    document
        .querySelectorAll(".menu-item")
        .forEach(function (item) {

            item.classList.remove("ativo");

        });


    const menus = {

        dashboard:
            document.getElementById("menuDashboard"),

        ambulancia:
            document.getElementById("menuAmbulancia"),

        transferencia:
            document.getElementById("menuTransferencia"),

        apoio:
            document.getElementById("menuApoio"),

        registros:
            document.getElementById("menuRegistros")

    };


    if (menus[pagina]) {

        menus[pagina].classList.add("ativo");

    }


    // Título

    const titulo =
        document.getElementById("tituloPagina");

    const titulos = {

        dashboard: "Dashboard",

        ambulancia: "Ambulância",

        transferencia: "Transferência",

        apoio: "Apoio de Rota",

        registros: "Registros"

    };


    if (titulo) {

        titulo.textContent =
            titulos[pagina] || "Dashboard";

    }


    // IMPORTANTE:
    // fecha o menu no celular

    fecharSidebarMobile();


    // Atualiza registros quando abrir

    if (pagina === "registros") {

        carregarRegistros();

    }


    // Atualiza dashboard

    if (pagina === "dashboard") {

        carregarDashboard();

    }

};


// ======================================================
// DATAS
// ======================================================

function obterDataHoje() {

    const agora = new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(agora.getMonth() + 1)
            .padStart(2, "0");

    const dia =
        String(agora.getDate())
            .padStart(2, "0");

    return `${ano}-${mes}-${dia}`;

}


function formatarData(data) {

    if (!data) return "-";

    const partes =
        data.split("-");

    if (partes.length !== 3) {

        return data;

    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function definirDatas() {

    const hoje =
        obterDataHoje();


    const campos = [

        "dataAmbulancia",

        "dataTransferencia",

        "dataApoio"

    ];


    campos.forEach(function (id) {

        const campo =
            document.getElementById(id);

        if (campo) {

            campo.value = hoje;

        }

    });


    const dataTopbar =
        document.getElementById("dataAtualTopbar");

    if (dataTopbar) {

        const partes =
            hoje.split("-");

        dataTopbar.textContent =
            `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    const dataDashboard =
        document.getElementById("dataDashboard");

    if (dataDashboard) {

        const partes =
            hoje.split("-");

        dataDashboard.textContent =
            `${partes[2]}/${partes[1]}/${partes[0]}`;

    }

}


// ======================================================
// AMBULÂNCIA
// ======================================================

const formAmbulancia =
    document.getElementById("formAmbulancia");


if (formAmbulancia) {

    formAmbulancia.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!usuario) {

                alert("Usuário não autenticado.");

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
                        ).value
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
                    new Date().toISOString()

            };


            try {

                const novaReferencia =
                    push(
                        ref(db, "ambulancias")
                    );


                await set(
                    novaReferencia,
                    registro
                );


                alert(
                    "🚑 Ambulância registrada com sucesso!"
                );


                formAmbulancia.reset();

                definirDatas();

                carregarDashboard();

                carregarRegistros();


            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao registrar ambulância."
                );

            }

        }

    );

}


// ======================================================
// TRANSFERÊNCIA
// ======================================================

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
                    "Usuário não autenticado."
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
                    new Date().toISOString()

            };


            try {

                const novaReferencia =
                    push(
                        ref(db, "transferencias")
                    );


                await set(
                    novaReferencia,
                    registro
                );


                alert(
                    "🔄 Transferência registrada com sucesso!"
                );


                formTransferencia.reset();

                definirDatas();

                carregarDashboard();

                carregarRegistros();


            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao registrar transferência."
                );

            }

        }

    );

}


// ======================================================
// APOIO
// ======================================================

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
                    "Usuário não autenticado."
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
                        ).value
                    ),

                driverRealiza:
                    document.getElementById(
                        "driverRealizaApoio"
                    ).value.trim(),

                driverPrecisa:
                    document.getElementById(
                        "driverPrecisaApoio"
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
                    new Date().toISOString()

            };


            try {

                const novaReferencia =
                    push(
                        ref(db, "apoios")
                    );


                await set(
                    novaReferencia,
                    registro
                );


                alert(
                    "🤝 Apoio registrado com sucesso!"
                );


                formApoio.reset();

                definirDatas();

                carregarDashboard();

                carregarRegistros();


            } catch (erro) {

                console.error(erro);

                alert(
                    "Erro ao registrar apoio."
                );

            }

        }

    );

}


// ======================================================
// CARREGAR DASHBOARD
// ======================================================

async function carregarDashboard() {

    try {

        const registros = [];

        const caminhos = [

            {
                caminho: "ambulancias",
                tipo: "ambulancia"
            },

            {
                caminho: "transferencias",
                tipo: "transferencia"
            },

            {
                caminho: "apoios",
                tipo: "apoio"
            }

        ];


        for (const item of caminhos) {

            await new Promise(function (resolve) {

                onValue(
                    ref(db, item.caminho),
                    function (snapshot) {

                        const dados =
                            snapshot.val();

                        if (dados) {

                            Object.entries(dados)
                                .forEach(
                                    function (
                                        [id, registro]
                                    ) {

                                        registros.push({

                                            ...registro,

                                            id: id,

                                            tipo:
                                                item.tipo

                                        });

                                    }
                                );

                        }

                        resolve();

                    },
                    {
                        onlyOnce: true
                    }
                );

            });

        }


        const totalAmbulancias =
            registros.filter(
                r => r.tipo === "ambulancia"
            ).length;


        const totalTransferencias =
            registros.filter(
                r => r.tipo === "transferencia"
            ).length;


        const totalApoios =
            registros.filter(
                r => r.tipo === "apoio"
            ).length;


        const valorTotal =
            registros
                .filter(
                    r => r.tipo === "apoio"
                )
                .reduce(
                    (total, r) =>
                        total + Number(r.valor || 0),
                    0
                );


        // CARDS

        atualizarTexto(
            "totalAmbulancias",
            totalAmbulancias
        );

        atualizarTexto(
            "totalTransferencias",
            totalTransferencias
        );

        atualizarTexto(
            "totalApoios",
            totalApoios
        );


        atualizarTexto(
            "valorTotalApoios",
            formatarMoeda(valorTotal)
        );


        // HOJE

        const hoje =
            obterDataHoje();


        const registrosHoje =
            registros.filter(
                r => r.data === hoje
            );


        const hojeAmbulancias =
            registrosHoje.filter(
                r => r.tipo === "ambulancia"
            ).length;


        const hojeTransferencias =
            registrosHoje.filter(
                r => r.tipo === "transferencia"
            ).length;


        const hojeApoios =
            registrosHoje.filter(
                r => r.tipo === "apoio"
            ).length;


        const hojeValorApoios =
            registrosHoje
                .filter(
                    r => r.tipo === "apoio"
                )
                .reduce(
                    (total, r) =>
                        total + Number(r.valor || 0),
                    0
                );


        atualizarTexto(
            "hojeAmbulancias",
            hojeAmbulancias
        );

        atualizarTexto(
            "hojeTransferencias",
            hojeTransferencias
        );

        atualizarTexto(
            "hojeApoios",
            hojeApoios
        );

        atualizarTexto(
            "hojeValorApoios",
            formatarMoeda(
                hojeValorApoios
            )
        );


        // BARRAS

        atualizarTexto(
            "barraAmbulanciasTexto",
            totalAmbulancias
        );

        atualizarTexto(
            "barraTransferenciasTexto",
            totalTransferencias
        );

        atualizarTexto(
            "barraApoiosTexto",
            totalApoios
        );


        const totalGeral =
            totalAmbulancias +
            totalTransferencias +
            totalApoios;


        const porcentagemAmbulancia =
            totalGeral
                ? (totalAmbulancias / totalGeral) * 100
                : 0;


        const porcentagemTransferencia =
            totalGeral
                ? (totalTransferencias / totalGeral) * 100
                : 0;


        const porcentagemApoio =
            totalGeral
                ? (totalApoios / totalGeral) * 100
                : 0;


        const barraAmbulancias =
            document.getElementById(
                "barraAmbulancias"
            );

        const barraTransferencias =
            document.getElementById(
                "barraTransferencias"
            );

        const barraApoios =
            document.getElementById(
                "barraApoios"
            );


        if (barraAmbulancias) {

            barraAmbulancias.style.width =
                porcentagemAmbulancia + "%";

        }


        if (barraTransferencias) {

            barraTransferencias.style.width =
                porcentagemTransferencia + "%";

        }


        if (barraApoios) {

            barraApoios.style.width =
                porcentagemApoio + "%";

        }


        // ÚLTIMOS LANÇAMENTOS

        mostrarUltimosLancamentos(
            registros
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}


// ======================================================
// ÚLTIMOS LANÇAMENTOS
// ======================================================

function mostrarUltimosLancamentos(
    registros
) {

    const container =
        document.getElementById(
            "ultimosLancamentos"
        );


    if (!container) return;


    const ultimos =
        [...registros]
            .sort(
                (a, b) =>
                    new Date(
                        b.criadoEm || 0
                    ) -
                    new Date(
                        a.criadoEm || 0
                    )
            )
            .slice(0, 5);


    if (!ultimos.length) {

        container.innerHTML = `

            <div class="sem-registros-dashboard">

                <div>📋</div>

                Nenhum lançamento encontrado.

            </div>

        `;

        return;

    }


    container.innerHTML =
        ultimos.map(
            function (registro) {

                let icone = "📋";

                let nomeTipo = "Registro";

                let classe =
                    "lancamento-dashboard";


                if (
                    registro.tipo ===
                    "ambulancia"
                ) {

                    icone = "🚑";

                    nomeTipo =
                        "Ambulância";

                    classe +=
                        " lancamento-ambulancia";

                }


                if (
                    registro.tipo ===
                    "transferencia"
                ) {

                    icone = "🔄";

                    nomeTipo =
                        "Transferência";

                    classe +=
                        " lancamento-transferencia";

                }


                if (
                    registro.tipo ===
                    "apoio"
                ) {

                    icone = "🤝";

                    nomeTipo =
                        "Apoio";

                    classe +=
                        " lancamento-apoio";

                }


                return `

                    <div class="${classe}">

                        <div class="lancamento-esquerda">

                            <div class="lancamento-icone">
                                ${icone}
                            </div>

                            <div class="lancamento-info">

                                <strong>
                                    ${nomeTipo}
                                </strong>

                                <span>
                                    Rota:
                                    ${escapeHtml(
                                        registro.rota || "-"
                                    )}
                                </span>

                            </div>

                        </div>

                        <div class="lancamento-data">

                            ${formatarData(
                                registro.data
                            )}

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ======================================================
// CARREGAR REGISTROS
// ======================================================

async function carregarRegistros() {

    try {

        todosRegistros = [];


        const caminhos = [

            {
                caminho: "ambulancias",
                tipo: "ambulancia"
            },

            {
                caminho: "transferencias",
                tipo: "transferencia"
            },

            {
                caminho: "apoios",
                tipo: "apoio"
            }

        ];


        for (const item of caminhos) {

            await new Promise(function (resolve) {

                onValue(
                    ref(db, item.caminho),
                    function (snapshot) {

                        const dados =
                            snapshot.val();

                        if (dados) {

                            Object.entries(dados)
                                .forEach(
                                    function (
                                        [id, registro]
                                    ) {

                                        todosRegistros.push({

                                            ...registro,

                                            id: id,

                                            tipo:
                                                item.tipo,

                                            caminho:
                                                item.caminho

                                        });

                                    }
                                );

                        }

                        resolve();

                    },
                    {
                        onlyOnce: true
                    }
                );

            });

        }


        todosRegistros.sort(
            (a, b) =>
                new Date(
                    b.criadoEm || 0
                ) -
                new Date(
                    a.criadoEm || 0
                )
        );


        aplicarFiltros();


    } catch (erro) {

        console.error(
            "Erro ao carregar registros:",
            erro
        );

    }

}


// ======================================================
// FILTROS
// ======================================================

function aplicarFiltros() {

    const data =
        document.getElementById(
            "filtroData"
        )?.value || "";


    const rota =
        document.getElementById(
            "filtroRota"
        )?.value
            .toLowerCase()
            .trim() || "";


    const driver =
        document.getElementById(
            "filtroDriver"
        )?.value
            .toLowerCase()
            .trim() || "";


    const tipo =
        document.getElementById(
            "filtroTipo"
        )?.value || "";


    const filtrados =
        todosRegistros.filter(
            function (registro) {

                if (
                    data &&
                    registro.data !== data
                ) {

                    return false;

                }


                if (
                    rota &&
                    !String(
                        registro.rota || ""
                    )
                        .toLowerCase()
                        .includes(rota)
                ) {

                    return false;

                }


                if (driver) {

                    const textoDriver =
                        [

                            registro.driver,

                            registro.driverInicial,

                            registro.driverSubstituto,

                            registro.driverRealiza,

                            registro.driverPrecisa

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    if (
                        !textoDriver.includes(
                            driver
                        )
                    ) {

                        return false;

                    }

                }


                if (
                    tipo &&
                    registro.tipo !== tipo
                ) {

                    return false;

                }


                return true;

            }
        );


    renderizarRegistros(
        filtrados
    );

}


// ======================================================
// EVENTOS DOS FILTROS
// ======================================================

[
    "filtroData",
    "filtroRota",
    "filtroDriver",
    "filtroTipo"
].forEach(function (id) {

    const elemento =
        document.getElementById(id);


    if (!elemento) return;


    elemento.addEventListener(
        "input",
        aplicarFiltros
    );


    elemento.addEventListener(
        "change",
        aplicarFiltros
    );

});


// ======================================================
// RENDERIZAR REGISTROS
// ======================================================

function renderizarRegistros(
    registros
) {

    const container =
        document.getElementById(
            "listaRegistros"
        );


    if (!container) return;


    if (!registros.length) {

        container.innerHTML = `

            <div class="registro-card">

                <div class="sem-registros-dashboard">

                    <div>📋</div>

                    Nenhum registro encontrado.

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        registros.map(
            function (registro) {

                return criarCardRegistro(
                    registro
                );

            }
        ).join("");

}


// ======================================================
// CARD DE REGISTRO
// ======================================================

function criarCardRegistro(
    registro
) {

    let tipoTexto = "Registro";

    let tipoClasse = "";

    let icone = "📋";

    let detalhes = "";


    if (
        registro.tipo ===
        "ambulancia"
    ) {

        tipoTexto =
            "Ambulância";

        tipoClasse =
            "tipo-ambulancia";

        icone = "🚑";


        detalhes = `

            <div class="registro-dado">

                <span>Driver</span>

                <strong>
                    ${escapeHtml(
                        registro.driver || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Cidade</span>

                <strong>
                    ${escapeHtml(
                        registro.cidade || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Pacotes</span>

                <strong>
                    ${registro.pacotes ?? 0}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Meli que liberou</span>

                <strong>
                    ${escapeHtml(
                        registro.meliLiberou || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Motivo</span>

                <strong>
                    ${escapeHtml(
                        registro.motivo || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Lançado por</span>

                <strong>
                    ${escapeHtml(
                        registro.lancadoPor || "-"
                    )}
                </strong>

            </div>

        `;

    }


    if (
        registro.tipo ===
        "transferencia"
    ) {

        tipoTexto =
            "Transferência";

        tipoClasse =
            "tipo-transferencia";

        icone = "🔄";


        detalhes = `

            <div class="registro-dado">

                <span>Driver inicial</span>

                <strong>
                    ${escapeHtml(
                        registro.driverInicial || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Driver substituto</span>

                <strong>
                    ${escapeHtml(
                        registro.driverSubstituto || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Cidade</span>

                <strong>
                    ${escapeHtml(
                        registro.cidade || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Meli que liberou</span>

                <strong>
                    ${escapeHtml(
                        registro.meliLiberou || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Motivo</span>

                <strong>
                    ${escapeHtml(
                        registro.motivo || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Lançado por</span>

                <strong>
                    ${escapeHtml(
                        registro.lancadoPor || "-"
                    )}
                </strong>

            </div>

        `;

    }


    if (
        registro.tipo ===
        "apoio"
    ) {

        tipoTexto =
            "Apoio de Rota";

        tipoClasse =
            "tipo-apoio";

        icone = "🤝";


        detalhes = `

            <div class="registro-dado">

                <span>Valor</span>

                <strong>
                    ${formatarMoeda(
                        Number(
                            registro.valor || 0
                        )
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Realiza apoio</span>

                <strong>
                    ${escapeHtml(
                        registro.driverRealiza || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Precisa apoio</span>

                <strong>
                    ${escapeHtml(
                        registro.driverPrecisa || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Quem liberou</span>

                <strong>
                    ${escapeHtml(
                        registro.quemLiberou || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Observações</span>

                <strong>
                    ${escapeHtml(
                        registro.observacoes || "-"
                    )}
                </strong>

            </div>

            <div class="registro-dado">

                <span>Lançado por</span>

                <strong>
                    ${escapeHtml(
                        registro.lancadoPor || "-"
                    )}
                </strong>

            </div>

        `;

    }


    return `

        <div class="registro-card">

            <div class="registro-topo">

                <div>

                    <span
                        class="registro-tipo ${tipoClasse}"
                    >

                        ${icone}

                        ${tipoTexto}

                    </span>

                </div>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                    "
                >

                    <span class="registro-data">

                        ${formatarData(
                            registro.data
                        )}

                    </span>

                    <button
                        class="btn-excluir"
                        onclick="excluirRegistro(
                            '${registro.tipo}',
                            '${registro.caminho}',
                            '${registro.id}'
                        )"
                    >
                        Excluir
                    </button>

                </div>

            </div>


            <div
                class="registro-dados"
            >

                <div class="registro-dado">

                    <span>Rota</span>

                    <strong>
                        ${escapeHtml(
                            registro.rota || "-"
                        )}
                    </strong>

                </div>

                ${detalhes}

            </div>

        </div>

    `;

}


// ======================================================
// EXCLUIR REGISTRO
// ======================================================

window.excluirRegistro = async function (
    tipo,
    caminho,
    id
) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este registro?"
        );


    if (!confirmar) return;


    try {

        await remove(
            ref(
                db,
                `${caminho}/${id}`
            )
        );


        alert(
            "Registro excluído com sucesso."
        );


        carregarDashboard();

        carregarRegistros();


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao excluir registro."
        );

    }

};


// ======================================================
// ALTERAR SENHA
// ======================================================

window.abrirAlterarSenha = function () {

    const modal =
        document.getElementById(
            "modalSenha"
        );


    if (!modal) return;


    modal.classList.remove(
        "escondida"
    );


    const mensagem =
        document.getElementById(
            "mensagemSenha"
        );


    if (mensagem) {

        mensagem.className =
            "mensagem";

        mensagem.textContent = "";

    }

};


window.fecharAlterarSenha = function () {

    const modal =
        document.getElementById(
            "modalSenha"
        );


    if (!modal) return;


    modal.classList.add(
        "escondida"
    );

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


            if (
                novaSenha !==
                confirmarSenha
            ) {

                mensagem.className =
                    "mensagem erro";

                mensagem.textContent =
                    "As novas senhas não são iguais.";

                return;

            }


            if (novaSenha.length < 6) {

                mensagem.className =
                    "mensagem erro";

                mensagem.textContent =
                    "A nova senha deve ter pelo menos 6 caracteres.";

                return;

            }


            try {

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


                mensagem.className =
                    "mensagem sucesso";

                mensagem.textContent =
                    "Senha alterada com sucesso!";


                formAlterarSenha.reset();


            } catch (erro) {

                console.error(erro);


                mensagem.className =
                    "mensagem erro";


                if (
                    erro.code ===
                    "auth/wrong-password" ||
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    mensagem.textContent =
                        "A senha atual está incorreta.";

                } else if (
                    erro.code ===
                    "auth/weak-password"
                ) {

                    mensagem.textContent =
                        "A nova senha é muito fraca.";

                } else if (
                    erro.code ===
                    "auth/requires-recent-login"
                ) {

                    mensagem.textContent =
                        "Faça login novamente antes de alterar a senha.";

                } else {

                    mensagem.textContent =
                        "Não foi possível alterar a senha.";

                }

            }

        }
    );

}


// ======================================================
// RECUPERAR SENHA
// ======================================================

window.abrirRecuperarSenha = function () {

    const modal =
        document.getElementById(
            "modalRecuperarSenha"
        );


    if (!modal) return;


    modal.classList.remove(
        "escondida"
    );


    const emailLogin =
        document.getElementById(
            "loginEmail"
        )?.value || "";


    const campoEmail =
        document.getElementById(
            "emailRecuperacao"
        );


    if (
        campoEmail &&
        emailLogin
    ) {

        campoEmail.value =
            emailLogin;

    }

};


window.fecharRecuperarSenha =
    function () {

        const modal =
            document.getElementById(
                "modalRecuperarSenha"
            );


        if (!modal) return;


        modal.classList.add(
            "escondida"
        );

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


            mensagem.className =
                "mensagem";

            mensagem.textContent = "";


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                mensagem.className =
                    "mensagem sucesso";


                mensagem.textContent =
                    "E-mail de recuperação enviado! Verifique também a pasta Spam.";

            } catch (erro) {

                console.error(erro);


                mensagem.className =
                    "mensagem erro";


                if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    mensagem.textContent =
                        "Não encontramos uma conta com esse e-mail.";

                } else {

                    mensagem.textContent =
                        "Não foi possível enviar o e-mail de recuperação.";

                }

            }

        }
    );

}


// ======================================================
// FECHAR MODAIS CLICANDO FORA
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        const modalSenha =
            document.getElementById(
                "modalSenha"
            );


        const modalRecuperar =
            document.getElementById(
                "modalRecuperarSenha"
            );


        if (
            modalSenha &&
            event.target === modalSenha
        ) {

            fecharAlterarSenha();

        }


        if (
            modalRecuperar &&
            event.target === modalRecuperar
        ) {

            fecharRecuperarSenha();

        }

    }
);


// ======================================================
// UTILITÁRIOS
// ======================================================

function atualizarTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


function formatarMoeda(
    valor
) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}


function escapeHtml(
    texto
) {

    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        definirDatas();

        console.log(
            "Caxiense Controle iniciado."
        );

    }
);