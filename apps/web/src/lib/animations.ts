import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initAnimations() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.registerPlugin(ScrollTrigger)

  // Scroll reveal for [data-animate="reveal"] elements
  gsap.utils.toArray('[data-animate="reveal"]').forEach((el: any) => {
    gsap.from(el, {
      y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  })

  // Stagger children for [data-animate="stagger"] containers
  gsap.utils.toArray('[data-animate="stagger"]').forEach((parent: any) => {
    gsap.from(parent.children, {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: parent, start: 'top 80%', once: true },
    })
  })

  // Parallax for [data-animate="parallax"] elements
  gsap.utils.toArray('[data-animate="parallax"]').forEach((el: any) => {
    gsap.to(el, {
      yPercent: -15, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
  })

  // Header solid on scroll
  const header = document.querySelector('[data-header]')
  if (header) {
    ScrollTrigger.create({
      trigger: 'body', start: 'top -80px',
      onEnter: () => header.classList.add('header-solid'),
      onLeaveBack: () => header.classList.remove('header-solid'),
    })
  }
}
