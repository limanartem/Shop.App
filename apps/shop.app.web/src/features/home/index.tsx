import {
  Card,
  CardHeader,
  CardContent,
  Alert,
  Typography,
  List,
  ListItem,
  Link,
} from '@mui/material';

function Home() {
  return (
    <Card style={{ width: '100%' }} data-testid="feature-home">
      <CardHeader title="Shop Home" subheader="Your home for eCommerce" />
      <CardContent style={{ paddingTop: 0 }}>
        <Alert severity="info">
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                This is not a real online shop and is only built for demonstration purposes
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                All products and images were generated using AI tools. For example&nbsp;
                <Link href="https://novita.ai/" target="_blank" rel="noreferrer" underline="hover">
                  novita.ai
                </Link>
              </Typography>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <Typography>
                The UI is built using React +&nbsp;
                <Link href="https://mui.com" target="_blank" rel="noreferrer" underline="hover">
                mUI
                </Link>
              </Typography>
            </ListItem>
          </List>
        </Alert>
      </CardContent>
    </Card>
  );
}

export default Home;
