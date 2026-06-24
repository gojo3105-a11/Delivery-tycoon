// Assets/_Project/Scripts/UI/UIView.cs
// 모든 UI 뷰의 기본 추상 클래스

using System.Collections;
using UnityEngine;

namespace HedgehogDeliveryTycoon.UI
{
    /// <summary>
    /// 모든 UI 패널 및 팝업의 기본 클래스.
    /// 열기/닫기 애니메이션과 데이터 바인딩 인터페이스를 제공합니다.
    /// </summary>
    public abstract class UIView : MonoBehaviour
    {
        [Header("UI View 기본 설정")]
        [SerializeField] protected CanvasGroup canvasGroup;
        [SerializeField] protected float animDuration = 0.25f;
        [SerializeField] protected bool destroyOnClose = false;

        public bool IsVisible { get; private set; }

        protected virtual void Awake()
        {
            if (canvasGroup == null)
                canvasGroup = GetComponent<CanvasGroup>();
        }

        // ── 열기 / 닫기 ────────────────────────────────────────────────────

        public virtual void Show(object data = null)
        {
            gameObject.SetActive(true);
            IsVisible = true;
            OnBeforeShow(data);
            StartCoroutine(FadeIn());
        }

        public virtual void Hide()
        {
            StartCoroutine(FadeOut(() =>
            {
                IsVisible = false;
                OnAfterHide();
                if (destroyOnClose) Destroy(gameObject);
                else gameObject.SetActive(false);
            }));
        }

        public virtual void ShowImmediate(object data = null)
        {
            gameObject.SetActive(true);
            IsVisible = true;
            if (canvasGroup != null) { canvasGroup.alpha = 1f; canvasGroup.interactable = true; canvasGroup.blocksRaycasts = true; }
            OnBeforeShow(data);
        }

        public virtual void HideImmediate()
        {
            IsVisible = false;
            if (canvasGroup != null) { canvasGroup.alpha = 0f; canvasGroup.interactable = false; canvasGroup.blocksRaycasts = false; }
            OnAfterHide();
            if (destroyOnClose) Destroy(gameObject);
            else gameObject.SetActive(false);
        }

        // ── 애니메이션 ─────────────────────────────────────────────────────

        protected virtual IEnumerator FadeIn()
        {
            if (canvasGroup == null) yield break;
            canvasGroup.alpha = 0f;
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;

            float elapsed = 0f;
            while (elapsed < animDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                canvasGroup.alpha = Mathf.Clamp01(elapsed / animDuration);
                yield return null;
            }
            canvasGroup.alpha = 1f;
            canvasGroup.interactable = true;
            canvasGroup.blocksRaycasts = true;
            OnShowComplete();
        }

        protected virtual IEnumerator FadeOut(System.Action onComplete = null)
        {
            if (canvasGroup == null) { onComplete?.Invoke(); yield break; }
            canvasGroup.interactable = false;
            canvasGroup.blocksRaycasts = false;

            float elapsed = 0f;
            float startAlpha = canvasGroup.alpha;
            while (elapsed < animDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                canvasGroup.alpha = Mathf.Lerp(startAlpha, 0f, elapsed / animDuration);
                yield return null;
            }
            canvasGroup.alpha = 0f;
            onComplete?.Invoke();
        }

        // ── 서브클래스 오버라이드 포인트 ──────────────────────────────────

        /// <summary>Show() 호출 직후, 애니메이션 전에 데이터 바인딩 수행</summary>
        protected virtual void OnBeforeShow(object data) { }

        /// <summary>페이드인 완료 후 호출</summary>
        protected virtual void OnShowComplete() { }

        /// <summary>Hide() 완료 후 정리 작업</summary>
        protected virtual void OnAfterHide() { }

        /// <summary>외부 데이터로 UI 갱신 (서브클래스에서 구현)</summary>
        public virtual void Refresh() { }
    }
}
