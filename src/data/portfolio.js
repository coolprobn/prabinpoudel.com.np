import Soono from '../images/portfolio/soono.webp';
import TriviaDay from '../images/portfolio/trivia-day.webp';
import Flexonet from '../images/portfolio/flexonet.webp';

const portfolio = [
  {
    uid: 1,
    name: 'Soono',
    featuredImage: Soono,
    description: 'Soono is a survey app that lets your customer take the survey of your business to provide feedbacks. It then provides you with reports that can be analyzed further to make improvements based on the reviews.',
    technologies: ['ReactJS', 'Ruby on Rails'],
    category: 'Web',
    website: 'https://mysoono.com/'
  },
  {
    uid: 2,
    name: 'Trivia Day',
    featuredImage: TriviaDay,
    description: 'Trivia Day is a competitive trivia game where teams, families, and friends can get together for a few brief rounds of challenging trivia that leads to a ton of fun.',
    technologies: ['React Native'],
    category: 'Mobile',
    playStore: 'https://play.google.com/store/apps/details?id=com.trivia_day',
    appStore: 'https://apps.apple.com/us/app/trivia-day/id1419081111'
  },
  {
    uid: 3,
    name: 'Flexonet',
    featuredImage: Flexonet,
    description: 'Flexonet is a flexible telecommunications company with a focus on individual solutions for business. This project is built to help the company ease the invoicing process by integrating closely with Odoo APIs.',
    technologies: ['ReactJS', 'Ruby on Rails', 'Odoo'],
    category: 'Web',
    website: 'http://mit-live.flexonet.dk/'
  },
];

export default portfolio;
