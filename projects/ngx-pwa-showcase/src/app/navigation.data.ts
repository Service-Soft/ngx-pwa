import { NavElementTypes, NavbarRow } from 'ngx-material-navigation';

export const navbarRows: NavbarRow[] = [
    {
        elements: [
            {
                type: NavElementTypes.TITLE_WITH_INTERNAL_LINK,
                title: 'Home',
                link: {
                    route: '/'
                }
            }
        ]
    }
];