import Navbar from "@/components/Navbar/Navbar";
import styles from "./page.module.css";
import { ArrowRight, Shield, Clock, Star } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Professional <span className="gradient-text">Home Services</span> <br />
              At Your Fingertips
            </h1>
            <p className={styles.description}>
              The premium platform connecting expert workers with clients. Reliable, secure, and modern.
            </p>
            <div className={styles.actions}>
              <Link href="/register" className="btn-primary">
                Get Started <ArrowRight size={20} />
              </Link>
              <Link href="/offers" className={styles.secondaryBtn}>
                Browse Offers
              </Link>
            </div>
          </div>
        </div>
        
        <div className={styles.heroBg}>
          <div className={styles.blob1}></div>
          <div className={styles.blob2}></div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="container">
          <div className={styles.grid}>
            <div className={`${styles.featureCard} glass`}>
              <Shield className={styles.featureIcon} size={40} />
              <h3>Secure Payments</h3>
              <p>Every transaction is protected and transparent.</p>
            </div>
            <div className={`${styles.featureCard} glass`}>
              <Clock className={styles.featureIcon} size={40} />
              <h3>Fast Response</h3>
              <p>Get your tasks done quickly by verified pros.</p>
            </div>
            <div className={`${styles.featureCard} glass`}>
              <Star className={styles.featureIcon} size={40} />
              <h3>Top Quality</h3>
              <p>Only the best workers are approved on our platform.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
