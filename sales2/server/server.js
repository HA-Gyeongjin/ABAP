const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());

// CORS 설정 추가
app.use(cors());

const YOUR_ADMIN_KEY = '08b7e210754118e01e7f8cd100c48fc7'; // 카카오페이 Admin Key

// 정적 파일을 제공할 디렉터리 설정
app.use(express.static(path.join(__dirname, 'webapp')));

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
            approval_url: 'http://localhost:3000/approval', // 변경된 포트 번호 사용
            cancel_url: 'http://localhost:3000/cancel', // 변경된 포트 번호 사용
            fail_url: 'http://localhost:3000/fail', // 변경된 포트 번호 사용
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

// 승인 핸들러 수정
app.get('/approval', (req, res) => {
    console.log('Payment approved');
    res.redirect('http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#synczecsales1-display&/success'); // 변경된 포트 번호 사용
});

app.get('/cancel', (req, res) => {
    console.log('Payment cancelled');
    res.redirect('http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#synczecsales1-display&/');
});

app.get('/fail', (req, res) => {
    console.log('Payment failed');
    res.redirect('http://localhost:8080/test/flpSandbox.html?sap-client=100&sap-ui-xx-viewCache=false#synczecsales1-display&/fail');
});

const PORT = 3000; // 원하는 포트 번호로 변경
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
