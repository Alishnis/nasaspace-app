#!/usr/bin/env node

const axios = require('axios');

async function testNotificationSubscription() {
    console.log('🧪 Testing NASA TEMPO Air Quality Alert Subscription...\n');
    
    try {
        // Test subscription with email
        console.log('📧 Testing email subscription...');
        const emailResponse = await axios.post('http://localhost:3003/api/notifications/subscribe', {
            lat: 40.7128,
            lng: -74.0060,
            email: 'test@example.com',
            alertLevels: ['unhealthy', 'very-unhealthy', 'hazardous']
        });
        
        console.log('✅ Email subscription successful:');
        console.log(`   Subscription ID: ${emailResponse.data.subscriptionId}`);
        console.log(`   Message: ${emailResponse.data.message}`);
        console.log(`   Email: ${emailResponse.data.subscription.email}`);
        console.log(`   Location: ${emailResponse.data.subscription.location.lat}, ${emailResponse.data.subscription.location.lng}`);
        console.log(`   Alert Levels: ${emailResponse.data.subscription.alertLevels.join(', ')}\n`);
        
        // Test subscription with phone
        console.log('📱 Testing SMS subscription...');
        const smsResponse = await axios.post('http://localhost:3003/api/notifications/subscribe', {
            lat: 55.7558,
            lng: 37.6176,
            phone: '+1234567890',
            alertLevels: ['unhealthy', 'very-unhealthy', 'hazardous']
        });
        
        console.log('✅ SMS subscription successful:');
        console.log(`   Subscription ID: ${smsResponse.data.subscriptionId}`);
        console.log(`   Message: ${smsResponse.data.message}`);
        console.log(`   Phone: ${smsResponse.data.subscription.phone}`);
        console.log(`   Location: ${smsResponse.data.subscription.location.lat}, ${smsResponse.data.subscription.location.lng}`);
        console.log(`   Alert Levels: ${smsResponse.data.subscription.alertLevels.join(', ')}\n`);
        
        // Test subscription with both email and phone
        console.log('📧📱 Testing combined subscription...');
        const combinedResponse = await axios.post('http://localhost:3003/api/notifications/subscribe', {
            lat: 51.5074,
            lng: -0.1278,
            email: 'london@example.com',
            phone: '+44123456789',
            alertLevels: ['unhealthy', 'very-unhealthy', 'hazardous']
        });
        
        console.log('✅ Combined subscription successful:');
        console.log(`   Subscription ID: ${combinedResponse.data.subscriptionId}`);
        console.log(`   Message: ${combinedResponse.data.message}`);
        console.log(`   Email: ${combinedResponse.data.subscription.email}`);
        console.log(`   Phone: ${combinedResponse.data.subscription.phone}`);
        console.log(`   Location: ${combinedResponse.data.subscription.location.lat}, ${combinedResponse.data.subscription.location.lng}`);
        console.log(`   Alert Levels: ${combinedResponse.data.subscription.alertLevels.join(', ')}\n`);
        
        console.log('🎉 All tests completed successfully!');
        console.log('📝 Check the server logs to see the test notifications being sent.');
        console.log('💡 In development mode, notifications are logged to console instead of actually being sent.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testNotificationSubscription();
