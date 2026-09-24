import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


import {
    getDatabase,
    ref,
    push,
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


// =====================================================
// CONFIGURAÇÃO FIREBASE
// =====================================================

const firebaseConfig = {

    // 
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


// =====================================================
// INICIALIZAR FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


const db =
    getDatabase(app);


const auth =
    getAuth(app);


let todosOsRegistros = [];


// =====================================================
// LOGIN
// =====================================================

document
    .getElementById("formLogin")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const senha =
                document
                    .getElementById("loginSenha")
                    .value;


            const mensagem =
                document
                    .getElementById("mensagemLogin");


            mensagem.style.color =
                "#2563eb";


            mensagem.textContent =
                "⏳ Entrando...";


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );


                mensagem.textContent = "";


            } catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );


                mensagem.style.color =
                    "#dc2626";


                if (
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    mensagem.textContent =
                        "❌ E-mail ou senha incorretos.";

                }

                else if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    mensagem.textContent =
                        "❌ Usuário não encontrado.";

                }

                else if (
                    erro.code ===
                    "auth/wrong-password"
                ) {

                    mensagem.textContent =
                        "❌ Senha incorreta.";

                }

                else if (
                    erro.code ===
                    "auth/invalid-api-key"
                ) {

                    mensagem.textContent =
                        "❌ API Key inválida.";

                }

                else {

                    mensagem.textContent =
                        "❌ Não foi possível fazer login.";

                }

            }

        }
    );


// =====================================================
// USUÁRIO LOGADO
// =====================================================

onAuthStateChanged(
    auth,
    function(usuario) {

        const telaLogin =
            document.getElementById(
                "telaLogin"
            );


        const sistema =
            document.getElementById(
                "sistema"
            );


        const nomeUsuario =
            document.getElementById(
                "nomeUsuario"
            );


        if (usuario) {

            console.log(
                "✅ Usuário logado:",
                usuario.email
            );


            telaLogin.classList.add(
                "escondida"
            );


            sistema.classList.remove(
                "escondida"
            );


            nomeUsuario.textContent =
                usuario.email;


            atualizarDashboard();

            carregarRegistros();

        }

        else {

            telaLogin.classList.remove(
                "escondida"
            );


            sistema.classList.add(
                "escondida"
            );

        }

    }
);


// =====================================================
// SAIR
// =====================================================

window.sairSistema =
    async function() {

        try {

            await signOut(auth);

        }

        catch (erro) {

            console.error(
                "Erro ao sair:",
                erro
            );

        }

    };


// =====================================================
// TROCAR TELA
// =====================================================

window.mostrarTela =
    function(id) {

        document
            .querySelectorAll(".tela")
            .forEach(
                function(tela) {

                    tela.classList.add(
                        "escondida"
                    );

                }
            );


        const tela =
            document.getElementById(id);


        if (tela) {

            tela.classList.remove(
                "escondida"
            );

        }

    };


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data) {

    if (!data) {

        return "-";

    }


    const partes =
        data.split("-");


    if (
        partes.length !== 3
    ) {

        return data;

    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// =====================================================
// SALVAR AMBULÂNCIA
// =====================================================

document
    .getElementById(
        "formAmbulancia"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const usuario =
                auth.currentUser;


            if (!usuario) {

                alert(
                    "❌ Você precisa estar logado."
                );

                return;

            }


            const registro = {

                tipo:
                    "ambulancia",

                data:
                    document
                        .getElementById(
                            "dataAmbulancia"
                        )
                        .value,

                rota:
                    document
                        .getElementById(
                            "rotaAmbulancia"
                        )
                        .value
                        .trim(),

                driver:
                    document
                        .getElementById(
                            "driverAmbulancia"
                        )
                        .value
                        .trim(),

                cidade:
                    document
                        .getElementById(
                            "cidadeAmbulancia"
                        )
                        .value
                        .trim(),

                pacotes:
                    document
                        .getElementById(
                            "pacotesAmbulancia"
                        )
                        .value,

                motivo:
                    document
                        .getElementById(
                            "motivoAmbulancia"
                        )
                        .value
                        .trim(),

                meliLiberou:
                    document
                        .getElementById(
                            "meliAmbulancia"
                        )
                        .value
                        .trim(),

                observacoes:
                    document
                        .getElementById(
                            "obsAmbulancia"
                        )
                        .value
                        .trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    new Date().toISOString()

            };


            try {

                await push(
                    ref(
                        db,
                        "ambulancias"
                    ),
                    registro
                );


                alert(
                    "✅ Ambulância registrada!"
                );


                document
                    .getElementById(
                        "formAmbulancia"
                    )
                    .reset();


                atualizarDashboard();

                carregarRegistros();

                mostrarTela(
                    "dashboard"
                );

            }

            catch (erro) {

                console.error(
                    "Erro ao salvar ambulância:",
                    erro
                );


                alert(
                    "❌ Erro ao salvar ambulância."
                );

            }

        }
    );


// =====================================================
// SALVAR TRANSFERÊNCIA
// =====================================================

document
    .getElementById(
        "formTransferencia"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const usuario =
                auth.currentUser;


            if (!usuario) {

                alert(
                    "❌ Você precisa estar logado."
                );

                return;

            }


            const registro = {

                tipo:
                    "transferencia",

                data:
                    document
                        .getElementById(
                            "dataTransferencia"
                        )
                        .value,

                rota:
                    document
                        .getElementById(
                            "rotaTransferencia"
                        )
                        .value
                        .trim(),

                driverInicial:
                    document
                        .getElementById(
                            "driverInicial"
                        )
                        .value
                        .trim(),

                driverSubstituto:
                    document
                        .getElementById(
                            "driverSubstituto"
                        )
                        .value
                        .trim(),

                cidade:
                    document
                        .getElementById(
                            "cidadeTransferencia"
                        )
                        .value
                        .trim(),

                motivo:
                    document
                        .getElementById(
                            "motivoTransferencia"
                        )
                        .value
                        .trim(),

                meliLiberou:
                    document
                        .getElementById(
                            "meliTransferencia"
                        )
                        .value
                        .trim(),

                observacoes:
                    document
                        .getElementById(
                            "obsTransferencia"
                        )
                        .value
                        .trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    new Date().toISOString()

            };


            try {

                await push(
                    ref(
                        db,
                        "transferencias"
                    ),
                    registro
                );


                alert(
                    "✅ Transferência registrada!"
                );


                document
                    .getElementById(
                        "formTransferencia"
                    )
                    .reset();


                atualizarDashboard();

                carregarRegistros();

                mostrarTela(
                    "dashboard"
                );

            }

            catch (erro) {

                console.error(
                    "Erro ao salvar transferência:",
                    erro
                );


                alert(
                    "❌ Erro ao salvar transferência."
                );

            }

        }
    );


// =====================================================
// DASHBOARD
// =====================================================

function atualizarDashboard() {


    onValue(
        ref(
            db,
            "ambulancias"
        ),
        function(snapshot) {

            let total = 0;


            if (
                snapshot.exists()
            ) {

                total =
                    Object.keys(
                        snapshot.val()
                    ).length;

            }


            document
                .getElementById(
                    "totalAmbulancias"
                )
                .textContent =
                total;

        },
        {
            onlyOnce: true
        }
    );


    onValue(
        ref(
            db,
            "transferencias"
        ),
        function(snapshot) {

            let total = 0;


            if (
                snapshot.exists()
            ) {

                total =
                    Object.keys(
                        snapshot.val()
                    ).length;

            }


            document
                .getElementById(
                    "totalTransferencias"
                )
                .textContent =
                total;

        },
        {
            onlyOnce: true
        }
    );

}


// =====================================================
// CARREGAR REGISTROS
// =====================================================

window.carregarRegistros =
    function() {

        todosOsRegistros = [];


        onValue(
            ref(
                db,
                "ambulancias"
            ),
            function(snapshot) {

                if (
                    snapshot.exists()
                ) {

                    const dados =
                        snapshot.val();


                    Object.entries(
                        dados
                    ).forEach(
                        function([
                            id,
                            registro
                        ]) {

                            todosOsRegistros.push({

                                id:
                                    id,

                                ...registro

                            });

                        }
                    );

                }


                carregarTransferencias();

            },
            {
                onlyOnce: true
            }
        );

    };


// =====================================================
// CARREGAR TRANSFERÊNCIAS
// =====================================================

function carregarTransferencias() {

    onValue(
        ref(
            db,
            "transferencias"
        ),
        function(snapshot) {

            if (
                snapshot.exists()
            ) {

                const dados =
                    snapshot.val();


                Object.entries(
                    dados
                ).forEach(
                    function([
                        id,
                        registro
                    ]) {

                        todosOsRegistros.push({

                            id:
                                id,

                            ...registro

                        });

                    }
                );

            }


            mostrarRegistros(
                todosOsRegistros
            );

        },
        {
            onlyOnce: true
        }
    );

}


// =====================================================
// MOSTRAR REGISTROS
// =====================================================

function mostrarRegistros(
    registros
) {

    const lista =
        document.getElementById(
            "listaRegistros"
        );


    if (!lista) {

        return;

    }


    lista.innerHTML = "";


    if (
        registros.length === 0
    ) {

        lista.innerHTML =
            "<p>📭 Nenhum registro encontrado.</p>";

        return;

    }


    registros.sort(
        function(a, b) {

            return (
                new Date(
                    b.criadoEm || 0
                ) -
                new Date(
                    a.criadoEm || 0
                )
            );

        }
    );


    registros.forEach(
        function(registro) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "registro";


            if (
                registro.tipo ===
                "ambulancia"
            ) {

                div.innerHTML = `

                    <h3>
                        🚑 Ambulância
                    </h3>

                    <p>
                        <strong>📅 Data:</strong>
                        ${formatarData(registro.data)}
                    </p>

                    <p>
                        <strong>🛣️ Rota:</strong>
                        ${registro.rota || "-"}
                    </p>

                    <p>
                        <strong>👤 Driver:</strong>
                        ${registro.driver || "-"}
                    </p>

                    <p>
                        <strong>📍 Cidade:</strong>
                        ${registro.cidade || "-"}
                    </p>

                    <p>
                        <strong>📦 Pacotes:</strong>
                        ${registro.pacotes || "-"}
                    </p>

                    <p>
                        <strong>⚠️ Motivo:</strong>
                        ${registro.motivo || "-"}
                    </p>

                    <p>
                        <strong>🟡 Liberado pelo Meli:</strong>
                        ${registro.meliLiberou || "-"}
                    </p>

                    <p>
                        <strong>📝 Observações:</strong>
                        ${registro.observacoes || "-"}
                    </p>

                    <p>
                        <strong>👤 Lançado por:</strong>
                        ${registro.lancadoPor || "-"}
                    </p>

                    <button
                        onclick="excluirAmbulancia('${registro.id}')"
                        class="botao-excluir"
                    >
                        🗑️ Excluir
                    </button>

                `;

            }

            else {

                div.innerHTML = `

                    <h3>
                        🔄 Transferência
                    </h3>

                    <p>
                        <strong>📅 Data:</strong>
                        ${formatarData(registro.data)}
                    </p>

                    <p>
                        <strong>🛣️ Rota:</strong>
                        ${registro.rota || "-"}
                    </p>

                    <p>
                        <strong>👤 Driver inicial:</strong>
                        ${registro.driverInicial || "-"}
                    </p>

                    <p>
                        <strong>🔄 Driver substituto:</strong>
                        ${registro.driverSubstituto || "-"}
                    </p>

                    <p>
                        <strong>📍 Cidade:</strong>
                        ${registro.cidade || "-"}
                    </p>

                    <p>
                        <strong>⚠️ Motivo:</strong>
                        ${registro.motivo || "-"}
                    </p>

                    <p>
                        <strong>🟡 Liberado pelo Meli:</strong>
                        ${registro.meliLiberou || "-"}
                    </p>

                    <p>
                        <strong>📝 Observações:</strong>
                        ${registro.observacoes || "-"}
                    </p>

                    <p>
                        <strong>👤 Lançado por:</strong>
                        ${registro.lancadoPor || "-"}
                    </p>

                    <button
                        onclick="excluirTransferencia('${registro.id}')"
                        class="botao-excluir"
                    >
                        🗑️ Excluir
                    </button>

                `;

            }


            lista.appendChild(div);

        }
    );

}


// =====================================================
// FILTROS
// =====================================================

window.filtrarRegistros =
    function() {

        const data =
            document
                .getElementById(
                    "filtroData"
                )
                .value;


        const rota =
            document
                .getElementById(
                    "filtroRota"
                )
                .value
                .trim()
                .toLowerCase();


        let filtrados =
            todosOsRegistros;


        if (data) {

            filtrados =
                filtrados.filter(
                    function(registro) {

                        return (
                            registro.data ===
                            data
                        );

                    }
                );

        }


        if (rota) {

            filtrados =
                filtrados.filter(
                    function(registro) {

                        return (
                            registro.rota &&
                            registro.rota
                                .toLowerCase()
                                .includes(
                                    rota
                                )
                        );

                    }
                );

        }


        mostrarRegistros(
            filtrados
        );

    };


// =====================================================
// LIMPAR FILTROS
// =====================================================

window.limparFiltros =
    function() {

        document
            .getElementById(
                "filtroData"
            )
            .value = "";


        document
            .getElementById(
                "filtroRota"
            )
            .value = "";


        mostrarRegistros(
            todosOsRegistros
        );

    };


// =====================================================
// EXCLUIR AMBULÂNCIA
// =====================================================

window.excluirAmbulancia =
    async function(id) {

        if (
            !confirm(
                "Tem certeza que deseja excluir este registro?"
            )
        ) {

            return;

        }


        try {

            await remove(
                ref(
                    db,
                    "ambulancias/" + id
                )
            );


            alert(
                "✅ Registro excluído."
            );


            carregarRegistros();

            atualizarDashboard();

        }

        catch (erro) {

            console.error(
                erro
            );


            alert(
                "❌ Não foi possível excluir."
            );

        }

    };


// =====================================================
// EXCLUIR TRANSFERÊNCIA
// =====================================================

window.excluirTransferencia =
    async function(id) {

        if (
            !confirm(
                "Tem certeza que deseja excluir este registro?"
            )
        ) {

            return;

        }


        try {

            await remove(
                ref(
                    db,
                    "transferencias/" + id
                )
            );


            alert(
                "✅ Registro excluído."
            );


            carregarRegistros();

            atualizarDashboard();

        }

        catch (erro) {

            console.error(
                erro
            );


            alert(
                "❌ Não foi possível excluir."
            );

        }

    };


// =====================================================
// ALTERAR SENHA
// =====================================================

window.abrirAlterarSenha =
    function() {

        document
            .getElementById(
                "modalSenha"
            )
            .classList.remove(
                "escondida"
            );


        document
            .getElementById(
                "formAlterarSenha"
            )
            .reset();


        document
            .getElementById(
                "mensagemSenha"
            )
            .textContent = "";

    };


window.fecharAlterarSenha =
    function() {

        document
            .getElementById(
                "modalSenha"
            )
            .classList.add(
                "escondida"
            );

    };


document
    .getElementById(
        "formAlterarSenha"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const usuario =
                auth.currentUser;


            if (!usuario) {

                alert(
                    "❌ Você precisa estar logado."
                );

                return;

            }


            const senhaAtual =
                document
                    .getElementById(
                        "senhaAtual"
                    )
                    .value;


            const novaSenha =
                document
                    .getElementById(
                        "novaSenha"
                    )
                    .value;


            const confirmarSenha =
                document
                    .getElementById(
                        "confirmarSenha"
                    )
                    .value;


            const mensagem =
                document
                    .getElementById(
                        "mensagemSenha"
                    );


            if (
                novaSenha.length < 6
            ) {

                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "❌ A nova senha precisa ter pelo menos 6 caracteres.";

                return;

            }


            if (
                novaSenha !==
                confirmarSenha
            ) {

                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "❌ As novas senhas não são iguais.";

                return;

            }


            if (
                senhaAtual ===
                novaSenha
            ) {

                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "❌ A nova senha precisa ser diferente da atual.";

                return;

            }


            mensagem.style.color =
                "#2563eb";

            mensagem.textContent =
                "⏳ Verificando senha atual...";


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


                mensagem.textContent =
                    "⏳ Salvando nova senha...";


                await updatePassword(
                    usuario,
                    novaSenha
                );


                mensagem.style.color =
                    "#16a34a";


                mensagem.textContent =
                    "✅ Senha alterada com sucesso!";


                document
                    .getElementById(
                        "formAlterarSenha"
                    )
                    .reset();


                setTimeout(
                    function() {

                        fecharAlterarSenha();

                    },
                    1500
                );

            }

            catch (erro) {

                console.error(
                    "Erro ao alterar senha:",
                    erro
                );


                mensagem.style.color =
                    "#dc2626";


                if (
                    erro.code ===
                    "auth/wrong-password" ||
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    mensagem.textContent =
                        "❌ A senha atual está incorreta.";

                }

                else if (
                    erro.code ===
                    "auth/weak-password"
                ) {

                    mensagem.textContent =
                        "❌ A nova senha é muito fraca.";

                }

                else if (
                    erro.code ===
                    "auth/requires-recent-login"
                ) {

                    mensagem.textContent =
                        "❌ Por segurança, saia e entre novamente antes de alterar a senha.";

                }

                else {

                    mensagem.textContent =
                        "❌ Erro ao alterar a senha.";

                }

            }

        }
    );


// =====================================================
// RECUPERAR SENHA
// =====================================================

window.abrirRecuperarSenha =
    function() {

        const modal =
            document.getElementById(
                "modalRecuperarSenha"
            );


        modal.classList.remove(
            "escondida"
        );


        const emailLogin =
            document
                .getElementById(
                    "loginEmail"
                )
                .value
                .trim();


        if (emailLogin) {

            document
                .getElementById(
                    "emailRecuperacao"
                )
                .value =
                emailLogin;

        }


        document
            .getElementById(
                "mensagemRecuperacao"
            )
            .textContent = "";

    };


window.fecharRecuperarSenha =
    function() {

        document
            .getElementById(
                "modalRecuperarSenha"
            )
            .classList.add(
                "escondida"
            );

    };


document
    .getElementById(
        "formRecuperarSenha"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "emailRecuperacao"
                    )
                    .value
                    .trim();


            const mensagem =
                document
                    .getElementById(
                        "mensagemRecuperacao"
                    );


            mensagem.style.color =
                "#2563eb";


            mensagem.textContent =
                "⏳ Enviando e-mail...";


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                mensagem.style.color =
                    "#16a34a";


                mensagem.textContent =
                    "✅ E-mail enviado! Verifique sua caixa de entrada e a pasta de spam.";

            }

            catch (erro) {

                console.error(
                    "Erro ao recuperar senha:",
                    erro
                );


                mensagem.style.color =
                    "#dc2626";


                if (
                    erro.code ===
                    "auth/invalid-email"
                ) {

                    mensagem.textContent =
                        "❌ Digite um e-mail válido.";

                }

                else if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    mensagem.textContent =
                        "❌ Não encontramos uma conta com esse e-mail.";

                }

                else {

                    mensagem.textContent =
                        "❌ Não foi possível enviar o e-mail.";

                }

            }

        }
    );