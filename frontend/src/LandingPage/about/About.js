import "./About.css";
import Twitter from '../Images/Logos/twitter.png';
import Github from '../Images/Logos/github.png';
import Linkedin from '../Images/Logos/Linked_in.png';
import Dan from '../Images/Users/Dan.png';
import Sam from '../Images/Users/Sam.png';
import Marvin from "../Images/Users/Marvin.png";


function About() {
        return (
                <section id="team" className="About_section">
                        <div className="About">
                                <h1>Meet our team</h1>
                                <p className="">
                                Our philosophy is simple — diversity and a grit mind set.A
                                team of passionate people and foster a culture that empowers 
                                you to do you best work.<br />
                                The following portfolio project is in dedication to our final term of Computer Science and Engeneering. 
                                </p>
                        </div>
                        <div className="Users">
                                <div className="Users-Card">
                                        <div className="Users-Card_image">
                                                <img className="Users-Card_profile" src={Dan} alt="Duncan Muchangi"/>
                                        </div>
                                        <h2 className="Users-Card_name">Navtej Singh</h2>
                                        <h3 className="Users-Card_specilization">Back-end Developer</h3>
                                        <p className="Users-Card_info">“Programing is thinking, not typing."</p>
                                        <div className="Users-Card_icons">
                                                <img className="Users-Card_icon" src={Twitter} alt="Twitter Logo" />
                                                <img className="Users-Card_icon" src={Github} alt="Twitter Logo" />
                                                <img className="Users-Card_icon" src={Linkedin} alt="Twitter Logo" />
                                        </div>
                                </div>
                                <div className="Users-Card">
                                        <div className="Users-Card_image">
                                                <img className="Users-Card_profile" src={Sam}  alt="Samuel Ekati"/>
                                        </div>
                                        <h2 className="Users-Card_name">Prerna Sharma</h2>
                                        <h3 className="Users-Card_specilization">Back-end Developer</h3>
                                        <p className="Users-Card_info">“I do not fear computers. I fear the lack of them."</p>
                                        <div className="Users-Card_icons">
                                                <img className="Users-Card_icon" src={Twitter} alt="Twitter Logo" />
                                                <img className="Users-Card_icon" src={Github} alt="Twitter Logo" />
                                                <img className="Users-Card_icon" src={Linkedin} alt="Twitter Logo" />
                                        </div>
                                </div>
                                <div className="Users-Card">
                                        <div className="Users-Card_image">
                                                <img className="Users-Card_profile" src={Marvin} alt="Marvin Kurland"/>
                                        </div>
                                        <h2 className="Users-Card_name">Pratham Malhotra</h2>
                                        <h3 className="Users-Card_specilization">Frontend Developer</h3>
                                        <p className="Users-Card_info">“The function of good software is to make the complex appear to be simple."</p>
                                        <div className="Users-Card_icons">
                                                <img className="Users-Card_icon" src={Twitter} alt="Twitter Logo" />
                                                <img className="Users-Card_icon" src={Github} alt="Twitter Logo" />
                                                <img className="Users-Card_icon" src={Linkedin} alt="Twitter Logo" />
                                        </div>
                                </div>
                        </div>
                </section>
        );
}

export default About;