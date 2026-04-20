'use client';

import layoutStyles from 'app/Layout.module.css';
import { DefaultButton } from 'app/components/Button';
import SkeletonImage from 'app/components/loaders/SkeletonImage';
import Tooltip from 'app/overlays/Tooltip';
import { useTransitionNav } from 'app/providers/TransitionProvider';
import { useRouter } from 'next/navigation';
import styles from './About.module.css';

export default function AboutPage() {
  const router = useRouter();
  const { transitionBack } = useTransitionNav();

  return (
    <main className={layoutStyles.container}>
      <div className={layoutStyles.formCard} style={{ maxWidth: 'var(--form-width-wide)' }}>
        <div className={styles.headerArea}>
          <div className={layoutStyles.header} style={{ marginBottom: 0 }}>
            <h3 className={layoutStyles.title}>앱 정보</h3>
            <p className={layoutStyles.subtitle}>
              본오동 열린 컴퓨터 교실 (Bono Open Class)
            </p>
          </div>
          <div className={styles.logo}>
            <SkeletonImage
              src="/app/logo-square-256.png"
              alt="App Logo"
              width={80}
              height={80}
              priority
            />
          </div>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>목적 및 목표</h4>
            <p className={styles.sectionText}>
              어린 학생들을 대상으로 더욱 안전하고 통제 가능하며 흥미를 이끌 수 있는 환경을 마련하여 정보 교육의 능률을 높입니다.
            </p>
            <section className={`${styles.section} ${styles.warningSection}`}>
              <p className={styles.sectionText}>
                이 앱은 안산열린교실 지역아동센터 컴퓨터 교육용으로 제작·운영 중으로 <strong>외부인 가입이 제한</strong>됩니다. (별도의 관리자 문의-승인 절차 필요)
              </p>
            </section>
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>권리 주장</h4>
            <p className={styles.sectionText}>
              이 앱은 오픈소스로 개발되었으며, 레포지토리 소유자는 본 앱의 운영권을 명백히 가집니다.
              <br />
              이 앱은 <strong style={{ color: 'var(--status-failure)' }}>수익 창출을 하지 않습니다.</strong>
            </p>
          </section>

          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>개발 정보</h4>
            <ul className={styles.list}>
              <li>
                <span className={styles.listLabel}>개발자</span>
                <span className={styles.listValue}>정태영 (가명: 안개비 - D. I. Space)</span>
              </li>
              <li>
                <span className={styles.listLabel}>연락처</span>
                <span className={styles.listValue}>
                  <a href="mailto:jtyoung1024@gmail.com" className={styles.link}>
                    jtyoung1024@gmail.com
                  </a>
                </span>
              </li>
              <li>
                <span className={styles.listLabel}>깃허브</span>
                <span className={styles.listValue}>
                  <a href="https://github.com/taeyoung24/bono-open-class" target="_blank" rel="noreferrer" className={styles.link}>
                    taeyoung24/bono-open-class
                  </a>
                </span>
              </li>
            </ul>
            <div className={styles.profileList}>
              <Tooltip content="안개비">
                <div className={styles.profileItem}>
                  <SkeletonImage
                    src="/app/LOGO 2024 3.png"
                    alt="안개비"
                    width={48}
                    height={48}
                    className={styles.profileImage}
                  />
                </div>
              </Tooltip>
              <Tooltip content="디아이 스페이스">
                <div className={styles.profileItem}>
                  <SkeletonImage
                    src="/app/dispace-profile.png"
                    alt="D. I. Space"
                    width={48}
                    height={48}
                    className={styles.profileImage}
                  />
                </div>
              </Tooltip>
            </div>
          </section>
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
          <DefaultButton
            text="뒤로 가기"
            variant="none"
            onClick={transitionBack}
          />
        </div>
      </div>

      <div className={layoutStyles.bottomFooter}>
        <p>© 2026 Bono Open Class. All rights reserved.</p>
      </div>
    </main>
  );
}
