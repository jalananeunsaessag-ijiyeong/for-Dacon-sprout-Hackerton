const express = require('express');
const router = express.Router();

router.post('/message', (req, res) => {
    const { message } = req.body;
    // 간단한 응답 처리 예시
    const response = processMessage(message);
    res.json({ response });
});

const processMessage = (message) => {
    if (message.includes('법률')) {
        return '법률 상담이 필요하신가요? 어떤 도움이 필요하신지 구체적으로 말씀해 주세요.';
    } else if (message.includes('위로')) {
        return '힘드시겠어요. 조금이라도 위로가 되었으면 좋겠어요.';
    }
    return '무엇을 도와드릴까요?';
};

module.exports = router;
