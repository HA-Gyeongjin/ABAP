const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(express.json());

// CORS 설정 추가
app.use(cors());

const YOUR_ADMIN_KEY = '08b7e210754118e01e7f8cd100c48fc7'; // 카카오페이 Admin Key

app.post('/pay', async (req, res) => {
    const { amount, item_name } = req.body;
    console.log('Received payment request:', req.body);

    try {
        const vat_amount = Math.floor(amount / 10); // 부가세 금액을 정수로 변환

        const response = await axios.post('https://kapi.kakao.com/v1/payment/ready', {
            cid: 'TC0ONETIME', // 테스트용 CID
            partner_order_id: 'partner_order_id',
            partner_user_id: 'partner_user_id',
            item_name: item_name,
            quantity: 1,
            total_amount: amount,
            vat_amount: vat_amount,
            tax_free_amount: 0,
            approval_url: 'http://localhost:3000/approval', // 등록된 도메인과 일치해야 합니다.
            cancel_url: 'http://localhost:3000/cancel', // 등록된 도메인과 일치해야 합니다.
            fail_url: 'http://localhost:3000/fail', // 등록된 도메인과 일치해야 합니다.
        }, {
            headers: {
                Authorization: `KakaoAK ${YOUR_ADMIN_KEY}`,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        });

        console.log('KakaoPay API response:', response.data);
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error during KakaoPay API call:', error.response.data);
            res.status(500).send('Payment initiation failed: ' + JSON.stringify(error.response.data));
        } else {
            console.error('Error during KakaoPay API call:', error.message);
            res.status(500).send('Payment initiation failed: ' + error.message);
        }
    }
});

// 승인 핸들러 추가
app.get('/approval', (req, res) => {
    console.log('Payment approved');
    res.send('Payment approved');
});

app.get('/cancel', (req, res) => {
    console.log('Payment cancelled');
    res.send('Payment cancelled');
});

app.get('/fail', (req, res) => {
    console.log('Payment failed');
    res.send('Payment failed');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
