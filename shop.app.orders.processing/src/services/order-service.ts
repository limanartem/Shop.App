const { ORDERS_API_URL, AUTH_API_URL, API_USER_EMAIL, API_USER_PASSWORD } = process.env;

type Status =
  | 'pending'
  | 'confirmed'
  | 'rejected'
  | 'failed'
  | 'paid'
  | 'unavailable'
  | 'dispatched'
  | 'delivered';

export const updateOrderStatusAsync = async (id: string, status: Status): Promise<void> => {
  const accessToken = await getAccessToken();
  console.log(`Updating order status using ${`${ORDERS_API_URL}/order/${id}`}`);
  const updateStatusResponse = await fetch(`${ORDERS_API_URL}/order/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!updateStatusResponse.ok) {
    console.error({
      status: updateStatusResponse.status,
      statusText: updateStatusResponse.statusText,
    });
    throw new Error('Unable to update order');
  }
  console.log(`Status for order "${id}" updated to "${status}"`);
};

const getAccessToken = async () => {
  console.log('Authenticating with api user...', { API_USER_EMAIL, API_USER_PASSWORD });
  const authResponse = await fetch(`${AUTH_API_URL}/auth/signin`, {
    method: 'POST',
    body: JSON.stringify({
      formFields: [
        {
          id: 'email',
          value: API_USER_EMAIL,
        },
        {
          id: 'password',
          value: API_USER_PASSWORD,
        },
      ],
    }),
  });

  if (!authResponse.ok) {
    console.error({ status: authResponse.status, statusText: authResponse.statusText });
    throw new Error(`Unable to authenticate ${API_USER_EMAIL}!`);
  }

  const accessToken = authResponse.headers.get('st-access-token');

  if (!accessToken) {
    throw new Error('Unable to authenticate!');
  }
  return accessToken;
};
