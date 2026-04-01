document.addEventListener('DOMContentLoaded', () => {
    const botGrid = document.querySelector('.bot-grid');

    // Örnek bot verileri
    const bots = [
        { id: 'bot1', name: 'Web Araştırma Botu', status: 'running', description: 'İnternet üzerinde bilgi toplar.' },
        { id: 'bot2', name: 'Haber Analiz Botu', status: 'idle', description: 'Günlük haberleri özetler.' },
        { id: 'bot3', name: 'Sosyal Medya Botu', status: 'running', description: 'Belirlenen platformlarda etkileşim sağlar.' },
        { id: 'bot4', name: 'Veri Giriş Botu', status: 'error', description: 'Veri tabanlarına bilgi girişi yapar.' },
        { id: 'bot5', name: 'E-posta Yönetim Botu', status: 'idle', description: 'Gelen kutusunu düzenler.' },
    ];

    const createBotCard = (bot) => {
        const botCard = document.createElement('div');
        botCard.className = 'bot-card';
        botCard.id = `bot-${bot.id}`;

        let statusClass = '';
        let statusText = '';
        let icon = '';

        switch (bot.status) {
            case 'running':
                statusClass = 'status-running';
                statusText = 'Çalışıyor';
                icon = '⚙️';
                break;
            case 'idle':
                statusClass = 'status-idle';
                statusText = 'Beklemede';
                icon = '😴';
                break;
            case 'error':
                statusClass = 'status-error';
                statusText = 'Hata';
                icon = '⚠️';
                break;
            default:
                statusClass = 'status-idle';
                statusText = 'Bilinmiyor';
                icon = '❓';
        }

        botCard.innerHTML = `
            <div class="bot-icon">${icon}</div>
            <h3>${bot.name}</h3>
            <p>${bot.description}</p>
            <div class="bot-status ${statusClass}">${statusText}</div>
        `;

        if (bot.status === 'running') {
            botCard.classList.add('running-animation'); // Animasyon sınıfı ekle
        }

        return botCard;
    };

    bots.forEach(bot => {
        botGrid.appendChild(createBotCard(bot));
    });

    // Çalışan botlar için basit bir CSS animasyonu tetikleyecek stil
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 5px rgba(46, 204, 113, 0.7); }
            50% { box-shadow: 0 0 20px rgba(46, 204, 113, 1); }
            100% { box-shadow: 0 0 5px rgba(46, 204, 113, 0.7); }
        }
        .running-animation {
            animation: pulse-glow 2s infinite alternate;
        }
    `;
    document.head.appendChild(style);

});
