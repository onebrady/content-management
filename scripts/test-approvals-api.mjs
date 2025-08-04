import fetch from 'node-fetch';

async function testApprovalsAPI() {
  try {
    console.log('Testing approvals API...\n');

    // Test the approvals API endpoint
    const response = await fetch('http://localhost:3000/api/approvals', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();

    console.log('API Response:');
    console.log(`Total approvals: ${data.approvals.length}`);
    console.log(`Stats:`, data.stats);

    console.log('\nApprovals:');
    data.approvals.forEach((approval, index) => {
      console.log(`\n${index + 1}. ${approval.content?.title || 'Unknown'}`);
      console.log(`   ID: ${approval.id}`);
      console.log(`   Status: ${approval.status}`);
      console.log(`   Content Status: ${approval.content?.status}`);
      console.log(`   Author: ${approval.content?.author?.name || 'Unknown'}`);
      console.log(`   Type: ${approval.content?.type || 'Unknown'}`);
      console.log(
        `   Is Pending Approval: ${approval._isPendingApproval || false}`
      );
      console.log(`   Approver: ${approval.user?.name || 'None'}`);
    });
  } catch (error) {
    console.error('Error testing approvals API:', error);
  }
}

testApprovalsAPI();
