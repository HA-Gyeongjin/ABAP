const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const KAKAO_API_KEY = '08b7e210754118e01e7f8cd100c48fc7';

app.post('/kakao-pay', async (req, res) => {
    try {
        const { totalAmount } = req.body;
        const response = await axios.post('https://kapi.kakao.com/v1/payment/ready', null, {
            headers: {
                'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            params: {
                cid: 'TC0ONETIME',
                partner_order_id: 'partner_order_id',
                partner_user_id: 'partner_user_id',
                item_name: 'item_name',
                quantity: 1,
                total_amount: 1233,
                vat_amount: 200,
                tax_free_amount: 0,
                approval_url: 'http://localhost:3000/approval',
                fail_url: 'http://localhost:3000/fail',
                cancel_url: 'http://localhost:3000/cancel'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});