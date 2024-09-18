const express = require("express");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.static("./public"));
app.set("view engine", "pug");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const users = [
    {
        uid: 1,
        name: "Wellington Wagner",
        email: "well@example.com",
        password: "senha123",
    },
    {
        uid: 2,
        name: "Maria Clara",
        email: "maria.clara@example.com",
        password: "senha456",
    },
    {
        uid: 3,
        name: "João Gabriel",
        email: "joao.gabriel@example.com",
        password: "senha789",
    },
    {
        uid: 4,
        name: "Ana Luiza",
        email: "ana.luiza@example.com",
        password: "senha321",
    },
    {
        uid: 5,
        name: "Carlos Eduardo",
        email: "carlos.eduardo@example.com",
        password: "senha654",
    },
    {
        uid: 6,
        name: "Beatriz Santos",
        email: "beatriz.santos@example.com",
        password: "senha987",
    },
];

let session = {};

function autenticador(email, password) {
    let count;
    let token;

    for (count = 0; count < users.length; count++) {
        if (
            users[count].email === email &&
            users[count].password === password
        ) {
            token = gerarToken(users[count]);
            return { user: users[count], authToken: token };
        }
    }
    return null;
}

function gerarToken(user) {
    const tokenBase = `${user.uid}-${user.email}-${Date.now()}`;
    return crypto.createHash("sha256").update(tokenBase).digest("hex");
}

function authMiddleware(req, res, next) {
    const authToken = req.cookies.authToken;

    if (session.authToken === authToken) {
        req.user = session.user;
        next();
    } else {
        res.status(401).redirect("/");
    }
}

app.get("/", (_, res) => {
    res.render("login");
});

app.post("/authenticated", (req, res) => {
    const { email, password } = req.body;
    const authResult = autenticador(email, password);
    session = authResult;

    if (authResult) {
        res.cookie("authToken", authResult.authToken, { httpOnly: true });
        res.status(200).json({
            message: "Login realizado com sucesso!",
        });
    } else {
        res.status(401).json({ message: "Usuário ou senha inválidos" });
    }
});

app.get("/home", authMiddleware, (req, res) => {
    res.render("home", { produtos, user: session.user });
});

const produtos = [
    {
        id: 1,
        nome: "Notebook",
        descricao:
            "Notebook Dell Inspiron 15, com processador Intel i7, 16GB de RAM, 512GB SSD, tela Full HD de 15.6 polegadas.",
        preco: 2999.99,
    },
    {
        id: 2,
        nome: "Mouse",
        descricao:
            "Mouse sem fio Logitech MX Master 3, ergonômico, com sensor de alta precisão e bateria recarregável.",
        preco: 99.99,
    },
    {
        id: 3,
        nome: "Teclado",
        descricao:
            "Teclado mecânico sem fio Keychron K2, com switches Red, retroiluminação RGB, compatível com Windows e macOS.",
        preco: 199.99,
    },
    {
        id: 4,
        nome: "Monitor",
        descricao:
            "Monitor LG UltraWide 34'', resolução 2560x1080, tecnologia IPS, ideal para multitarefa e edição de vídeo.",
        preco: 1499.99,
    },
    {
        id: 5,
        nome: "Headset",
        descricao:
            "Headset Gamer HyperX Cloud II, som surround 7.1, microfone removível, estrutura em alumínio.",
        preco: 499.99,
    },
    {
        id: 6,
        nome: "Impressora",
        descricao:
            "Impressora Multifuncional HP DeskJet 3776, com Wi-Fi, impressão, cópia e digitalização, compatível com smartphones e tablets.",
        preco: 399.99,
    },
];

app.get("/produtos", authMiddleware, (req, res) => {
    res.render("produtos", { produtos });
});

app.get("/cadastro", authMiddleware, (req, res) => {
    res.render("cadastro");
});

const server = app.listen(3000, "0.0.0.0", () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(
        `Aplicação WesleyTech Store está rodando no endereço IP ${host} e na porta ${port}`,
    );
});
