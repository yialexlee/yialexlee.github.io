// 核心变量
let scene, camera, renderer, starField, heartGroup;
const storyTexts = [
    "宝宝，你知道吗？",
    "遇见你，是我生命中最美好的相遇",
    "每一个和你在一起的瞬间，",
    "都像是在平淡生活里撒满了星光。",
    "我想和你一起，",
    "去吹晚风，去看日落，去走未来的路。",
    "虽然我们已经在一起了，",
    "但我还是想给你一个最正式的告白..."
];
let currentStoryIndex = 0;
let isAnimating = false;

// 3D 初始化
function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    camera.position.z = 50;

    // 星空背景
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 200;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ size: 0.2, color: 0xffffff, transparent: true, opacity: 0.5 });
    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 爱心组
    heartGroup = new THREE.Group();
    scene.add(heartGroup);

    addLights();
    animate();
}

function addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const point = new THREE.PointLight(0xff4d6d, 1.5);
    point.position.set(20, 20, 20);
    scene.add(point);
}

function animate() {
    requestAnimationFrame(animate);
    starField.rotation.y += 0.0005;
    starField.rotation.x += 0.0002;
    
    heartGroup.children.forEach(h => {
        h.rotation.y += 0.01;
        h.position.y += 0.03;
        if (h.position.y > 50) h.position.y = -50;
    });
    
    renderer.render(scene, camera);
}

// 逐字动画显示
function showStoryText(text) {
    if (isAnimating) return;
    isAnimating = true;
    
    const container = document.getElementById('story-content');
    container.innerHTML = '';
    
    // 将文本拆分为字符
    const chars = text.split('').map(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'char';
        container.appendChild(span);
        return span;
    });

    // 使用 GSAP 制作逐字浮现动画
    gsap.to(chars, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        onComplete: () => {
            isAnimating = false;
            // 更新进度条
            const progress = ((currentStoryIndex + 1) / storyTexts.length) * 100;
            document.getElementById('progress-bar').style.width = `${progress}%`;
        }
    });
}

// 鼠标跟随粒子
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.1) return; // 降低频率
    const p = document.createElement('div');
    p.className = 'particle';
    p.innerHTML = '❤️';
    p.style.left = e.clientX + 'px';
    p.style.top = e.clientY + 'px';
    p.style.color = `hsl(${Math.random() * 30 + 340}, 100%, 70%)`;
    document.getElementById('cursor-particles').appendChild(p);
    
    gsap.to(p, {
        y: e.clientY - 50 - Math.random() * 50,
        x: e.clientX + (Math.random() - 0.5) * 100,
        opacity: 0,
        scale: 0.5,
        duration: 1 + Math.random(),
        onComplete: () => p.remove()
    });
});

// 流程控制
const startBtn = document.getElementById('start-btn');
const bgMusic = document.getElementById('bg-music');

startBtn.addEventListener('click', () => {
    bgMusic.play().catch(() => {});
    switchScreen('intro-screen', 'story-screen');
    showStoryText(storyTexts[currentStoryIndex]);
});

document.getElementById('story-screen').addEventListener('click', () => {
    if (isAnimating) return;
    currentStoryIndex++;
    if (currentStoryIndex < storyTexts.length) {
        showStoryText(storyTexts[currentStoryIndex]);
    } else {
        switchScreen('story-screen', 'ritual-screen');
    }
});

// 长按仪式逻辑
const holdBtn = document.getElementById('hold-btn');
const holdProgress = holdBtn.querySelector('.hold-progress');
let holdTimer;
let holdStartTime;

function startHold() {
    holdStartTime = Date.now();
    holdTimer = setInterval(() => {
        const elapsed = Date.now() - holdStartTime;
        const percent = Math.min((elapsed / 2000) * 100, 100);
        holdProgress.style.height = percent + '%';
        if (percent >= 100) {
            clearInterval(holdTimer);
            switchScreen('ritual-screen', 'confession-screen');
        }
    }, 50);
}

function endHold() {
    clearInterval(holdTimer);
    holdProgress.style.height = '0%';
}

holdBtn.addEventListener('mousedown', startHold);
holdBtn.addEventListener('mouseup', endHold);
holdBtn.addEventListener('touchstart', startHold);
holdBtn.addEventListener('touchend', endHold);

// 表白逻辑
const noBtn = document.getElementById('no-btn');
let noCount = 0;
const noHints = ["点不到我吧~", "再想想嘛宝宝", "我会哭的哦", "这个按钮是坏的", "别点啦！"];

noBtn.addEventListener('mouseover', () => {
    if (noCount < 8) {
        const x = Math.random() * (window.innerWidth - 150);
        const y = Math.random() * (window.innerHeight - 50);
        gsap.to(noBtn, { position: 'fixed', left: x, top: y, duration: 0.3, ease: "power2.out" });
        document.getElementById('no-hint').innerText = noHints[Math.floor(Math.random() * noHints.length)];
        noCount++;
    } else {
        gsap.to(noBtn, { opacity: 0, scale: 0, duration: 0.5 });
        document.getElementById('no-hint').innerText = "嘿嘿，现在只能选愿意啦！";
    }
});

document.getElementById('yes-btn').addEventListener('click', () => {
    switchScreen('confession-screen', 'success-screen');
    startTimer();
    celebrate();
});

function switchScreen(from, to) {
    gsap.to(document.getElementById(from), { opacity: 0, duration: 0.8, onComplete: () => {
        document.getElementById(from).classList.remove('active');
        const toEl = document.getElementById(to);
        toEl.classList.add('active');
        gsap.fromTo(toEl, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8 });
    }});
}

function startTimer() {
    const startDate = new Date('202-12-31'); // 默认在一起的时间
    setInterval(() => {
        const now = new Date();
        const diff = now - startDate;
        document.getElementById('days').innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((diff / (1000 * 60 * 60)) % 24);
        document.getElementById('minutes').innerText = Math.floor((diff / (1000 * 60)) % 60);
        document.getElementById('seconds').innerText = Math.floor((diff / 1000) % 60);
    }, 1000);
}

function celebrate() {
    // 改变背景颜色
    gsap.to(starField.material.color, { r: 1, g: 0.3, b: 0.4, duration: 2 });
    // 增加爱心
    for (let i = 0; i < 365; i++) {
        const heart = create3DHeart();
        heartGroup.add(heart);
    }
}

function create3DHeart() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, 0, -5, 5, -5, 10);
    shape.bezierCurveTo(-5, 15, 0, 20, 5, 15);
    shape.bezierCurveTo(10, 20, 15, 15, 15, 10);
    shape.bezierCurveTo(15, 5, 10, 0, 0, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: true, bevelSize: 1 });
    const material = new THREE.MeshPhongMaterial({ color: 0xff4d6d });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.1, 0.1, 0.1);
    mesh.rotation.z = Math.PI;
    mesh.position.set((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
    return mesh;
}

window.onload = () => {
    init3D();
    for (let i = 0; i < 15; i++) heartGroup.add(create3DHeart());
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 全屏控制函数
function launchFullScreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// 修改原有的 start-btn 点击事件
document.getElementById('start-btn').addEventListener('click', () => {
    // 触发全屏（作用于整个文档根元素）
    launchFullScreen(document.documentElement);
    
    // 原有的逻辑
    bgMusic.play().catch(() => {});
    switchScreen('intro-screen', 'story-screen');
    showStoryText(storyTexts[currentStoryIndex]);
});
