import { NavbarRow } from 'ngx-material-navigation';

export const navbarRows: NavbarRow[] = [
    {
        elements: [
            {
                type: 'titleWithInternalLink',
                title: 'Home',
                link: {
                    route: '/'
                }
            }
        ]
    }
];