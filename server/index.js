import { Server } from "socket.io";

const io = new Server({
  cors: { origin: "http://localhost:5173" },
});

io.listen(3001);

const characters = [];
const WALK_SPEED = 0.1;
const RUN_SPEED = 0.2;
const GRAVITY = -0.10;
const JUMP_VELOCITY = 0.5;

function generateRandomPosition() {
  return [Math.random() * 3, 0, Math.random() * 3];
}

function generateRandomHexColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function moveTowards(position, target, speed) {
  if (!target) return position;

  const dx = target[0] - position[0];
  const dz = target[2] - position[2];
  const distance = Math.sqrt(dx * dx + dz * dz);

  if (distance < speed) return [target[0], position[1], target[2]];

  const nx = dx / distance;
  const nz = dz / distance;

  return [
    position[0] + nx * speed,
    position[1],
    position[2] + nz * speed
  ];
}

// --- Loop principal de actualización ---
setInterval(() => {
  let updated = false;

  for (const char of characters) {
    const input = char.input;
    const SPEED = input.run ? RUN_SPEED : WALK_SPEED;

    // --- Movimiento horizontal ---
    if (input.forward)  char.position[2] -= SPEED;
    if (input.backward) char.position[2] += SPEED;
    if (input.left)     char.position[0] -= SPEED;
    if (input.right)    char.position[0] += SPEED;

    // --- Movimiento hacia target ---
    if (input.target) {
      char.position = moveTowards(char.position, input.target, SPEED);
      const dx = char.position[0] - input.target[0];
      const dz = char.position[2] - input.target[2];
      if (Math.sqrt(dx*dx + dz*dz) < SPEED) input.target = null;
    }

    // --- Salto ---
    if (input.jump && char.isGrounded) {
      char.velocityY = JUMP_VELOCITY;
      char.isGrounded = false;
      input.jump = false; // consumimos el salto
    }

    // --- Gravedad ---
    char.velocityY += GRAVITY;
    char.position[1] += char.velocityY;

    // --- Colisión con el suelo ---
    if (char.position[1] <= 0) {
      char.position[1] = 0;
      char.velocityY = 0;
      char.isGrounded = true;
    }

    // --- Limites horizontales ---
    char.position[0] = Math.max(-10, Math.min(10, char.position[0]));
    char.position[2] = Math.max(-10, Math.min(10, char.position[2]));

    // --- Animación ---
    if (!char.isGrounded) {
      char.animation = "CharacterArmature|Jump";
    } else {
      const moving = input.forward || input.backward || input.left || input.right || input.target;
      char.animation = moving ? "CharacterArmature|Run" : "CharacterArmature|Idle";
    }

    updated = true;
  }

  if (updated) io.emit("characters", characters);
}, 50);

// --- Conexión de clientes ---
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  const newChar = {
    id: socket.id,
    position: generateRandomPosition(),
    hairColor: generateRandomHexColor(),
    topColor: generateRandomHexColor(),
    bottomColor: generateRandomHexColor(),
    shoeColor: generateRandomHexColor(),
    animation: "CharacterArmature|Idle",
    input: { forward: false, backward: false, left: false, right: false, run: false, target: null, jump: false },
    velocityY: 0,
    isGrounded: true,
  };
  characters.push(newChar);

  socket.emit("welcome");
  io.emit("characters", characters);

  socket.on("move", (input) => {
    const character = characters.find(c => c.id === socket.id);
    if (!character) return;

    character.input = { ...character.input, ...input }; // Guardamos input y target/jump
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    const index = characters.findIndex(c => c.id === socket.id);
    if (index !== -1) characters.splice(index, 1);
    io.emit("characters", characters);
  });
});
